const { Resend } = require('@resend/resend');
const config = require('../config/config');
const { Configuration, OpenAIApi } = require('@openai/api');

// Initialize Resend client
const resendApiKey = process.env.RESEND_API_KEY || config.resend.apiKey;
const resend = new Resend(resendApiKey);

// Initialize OpenAI client
const openaiApiKey = process.env.OPENAI_API_KEY || config.openai.apiKey;
const configuration = new Configuration({ apiKey: openaiApiKey });
const openai = new OpenAIApi(configuration);

/**
 * Send outreach email to a website
 * @param {Object} website - Website object with email and other properties
 * @param {string} emailType - Type of email (initial, followup1, followup2)
 * @returns {Promise<Object>} - Result of email sending operation
 */
async function sendOutreachEmail(website, emailType = 'initial') {
  console.log(`Sending ${emailType} email to ${website.domain} at ${website.email}`);
  
  if (!website.email) {
    return {
      success: false,
      error: 'No email address available',
      website
    };
  }
  
  try {
    // Generate email content using OpenAI
    const emailContent = await generateEmailContent(website, emailType);
    
    // Check if Resend API key is configured
    if (!resendApiKey || resendApiKey === 'your-resend-api-key') {
      console.warn('Resend API key not configured. Email would have been sent with the following content:');
      console.log(emailContent);
      
      return {
        success: true,
        mock: true,
        emailType,
        emailContent,
        sentAt: new Date().toISOString(),
        website
      };
    }
    
    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'outreach@yourdomain.com',
      to: website.email,
      subject: emailContent.subject,
      html: emailContent.body,
      text: emailContent.text
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Store email in database (would be implemented with Supabase)
    const emailRecord = {
      id: data.id,
      websiteId: website.id,
      type: emailType,
      subject: emailContent.subject,
      body: emailContent.body,
      sentAt: new Date().toISOString()
    };
    
    console.log(`Email sent successfully to ${website.email}`);
    
    return {
      success: true,
      emailId: data.id,
      emailType,
      sentAt: new Date().toISOString(),
      website
    };
  } catch (error) {
    console.error(`Error sending email to ${website.email}:`, error);
    
    return {
      success: false,
      error: error.message,
      emailType,
      website
    };
  }
}

/**
 * Generate email content using OpenAI
 * @param {Object} website - Website object with domain and other properties
 * @param {string} emailType - Type of email (initial, followup1, followup2)
 * @returns {Promise<Object>} - Email content object with subject, body, and text
 */
async function generateEmailContent(website, emailType) {
  // Check if OpenAI API key is configured
  if (!openaiApiKey || openaiApiKey === 'your-openai-api-key') {
    console.warn('OpenAI API key not configured. Using template email content.');
    return getTemplateEmailContent(website, emailType);
  }
  
  try {
    // Create prompt for OpenAI
    const prompt = createEmailPrompt(website, emailType);
    
    // Call OpenAI API
    const response = await openai.createCompletion({
      model: 'gpt-4',
      prompt,
      max_tokens: 500,
      temperature: 0.7
    });
    
    // Parse response to extract subject and body
    const content = response.data.choices[0].text.trim();
    const lines = content.split('\n');
    
    let subject = '';
    let body = '';
    
    // Extract subject line
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().startsWith('subject:')) {
        subject = lines[i].substring(8).trim();
        body = lines.slice(i + 1).join('\n').trim();
        break;
      }
    }
    
    // If no subject found, use first line as subject
    if (!subject) {
      subject = lines[0];
      body = lines.slice(1).join('\n').trim();
    }
    
    return {
      subject,
      body: body.replace(/\\n/g, '<br>'),
      text: body
    };
  } catch (error) {
    console.error('Error generating email content with OpenAI:', error);
    // Fall back to template email
    return getTemplateEmailContent(website, emailType);
  }
}

/**
 * Create prompt for OpenAI to generate email content
 * @param {Object} website - Website object
 * @param {string} emailType - Type of email
 * @returns {string} - Prompt for OpenAI
 */
function createEmailPrompt(website, emailType) {
  const basePrompt = `You are an outreach specialist for a digital marketing agency. Write a personalized email to the owner of ${website.domain}.`;
  
  let specificPrompt = '';
  
  switch (emailType) {
    case 'initial':
      specificPrompt = `
This is your first contact with them. You want to inquire about sponsored post opportunities on their blog.
Some details about their site:
- Domain: ${website.domain}
- Title: ${website.title || 'Unknown'}
- Domain Rating: ${website.dr || 'Unknown'}

Write a friendly, professional email that:
1. Introduces yourself and your agency
2. Mentions you found their site while researching quality blogs in their niche
3. Inquires about their sponsored post rates
4. Asks about their guidelines for sponsored content
5. Ends with a clear call to action

Format your response with a subject line starting with "Subject:" followed by the email body.
Keep it concise, around 150-200 words.`;
      break;
      
    case 'followup1':
      specificPrompt = `
This is a follow-up to your initial email sent a few days ago about sponsored post opportunities.
They haven't responded yet.

Write a gentle, non-pushy follow-up that:
1. References your previous email
2. Expresses continued interest
3. Offers to answer any questions they might have
4. Provides a clear call to action

Format your response with a subject line starting with "Subject:" followed by the email body.
Keep it very concise, around 100-150 words.`;
      break;
      
    case 'followup2':
      specificPrompt = `
This is your final follow-up email regarding sponsored post opportunities.
They haven't responded to your previous two emails.

Write a final, value-focused follow-up that:
1. Mentions this is your final follow-up
2. Offers a specific benefit or incentive
3. Provides your contact information
4. Leaves the door open for future collaboration

Format your response with a subject line starting with "Subject:" followed by the email body.
Keep it extremely concise, around 75-100 words.`;
      break;
      
    default:
      specificPrompt = `
Write a professional email inquiring about sponsored post opportunities.

Format your response with a subject line starting with "Subject:" followed by the email body.
Keep it concise, around 150 words.`;
  }
  
  return basePrompt + specificPrompt;
}

/**
 * Get template email content when OpenAI is not available
 * @param {Object} website - Website object
 * @param {string} emailType - Type of email
 * @returns {Object} - Email content object with subject, body, and text
 */
function getTemplateEmailContent(website, emailType) {
  let subject = '';
  let body = '';
  
  switch (emailType) {
    case 'initial':
      subject = `Sponsored Post Opportunity on ${website.domain}`;
      body = `
<p>Hello,</p>

<p>I hope this email finds you well. My name is [Your Name] from [Your Agency], and I came across your website ${website.domain} while researching quality blogs in your niche.</p>

<p>I'm reaching out to inquire about sponsored post opportunities on your site. We're interested in publishing high-quality, relevant content that would provide value to your audience.</p>

<p>Could you please share your rates for sponsored posts and any guidelines you have for this type of content?</p>

<p>Looking forward to potentially working together.</p>

<p>Best regards,<br>
[Your Name]<br>
[Your Agency]</p>
`;
      break;
      
    case 'followup1':
      subject = `Following Up: Sponsored Post on ${website.domain}`;
      body = `
<p>Hello again,</p>

<p>I wanted to follow up on my previous email regarding sponsored post opportunities on ${website.domain}.</p>

<p>I'm still interested in collaborating with you and would love to hear about your rates and guidelines when you have a moment.</p>

<p>Please let me know if you have any questions I can answer.</p>

<p>Best regards,<br>
[Your Name]<br>
[Your Agency]</p>
`;
      break;
      
    case 'followup2':
      subject = `Final Follow-up: Collaboration with ${website.domain}`;
      body = `
<p>Hello,</p>

<p>This is my final follow-up regarding potential sponsored content on ${website.domain}.</p>

<p>We're currently offering a 15% discount on our standard rates for new publishing partners, and I'd love to extend this offer to you.</p>

<p>If you're interested in discussing this opportunity in the future, please don't hesitate to reach out.</p>

<p>Best regards,<br>
[Your Name]<br>
[Your Agency]</p>
`;
      break;
      
    default:
      subject = `Regarding ${website.domain}`;
      body = `
<p>Hello,</p>

<p>I hope this email finds you well. I'm reaching out regarding potential collaboration opportunities with ${website.domain}.</p>

<p>I'd love to discuss this further at your convenience.</p>

<p>Best regards,<br>
[Your Name]<br>
[Your Agency]</p>
`;
  }
  
  return {
    subject,
    body,
    text: body.replace(/<\/?p>/g, '').replace(/<br>/g, '\n')
  };
}

module.exports = {
  sendOutreachEmail,
  generateEmailContent
};
