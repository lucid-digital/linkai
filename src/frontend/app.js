// LinksAI Frontend JavaScript

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const sections = {
    dashboard: document.getElementById('dashboard'),
    search: document.getElementById('search'),
    outreach: document.getElementById('outreach'),
    settings: document.getElementById('settings')
  };
  
  const navLinks = document.querySelectorAll('nav a');
  const newSearchBtn = document.getElementById('new-search-btn');
  const searchBtn = document.getElementById('search-btn');
  const searchResults = document.getElementById('search-results');
  const searchResultsTable = document.getElementById('search-results-table');
  const saveAllBtn = document.getElementById('save-all-btn');
  const emailAllBtn = document.getElementById('email-all-btn');
  const applyFiltersBtn = document.getElementById('apply-filters-btn');
  const saveSettingsBtn = document.getElementById('save-settings-btn');
  
  // Email modal elements
  const emailModal = document.getElementById('email-modal');
  const closeModal = document.querySelector('.close-modal');
  const emailTo = document.getElementById('email-to');
  const emailSubject = document.getElementById('email-subject');
  const emailBody = document.getElementById('email-body');
  const editEmailBtn = document.getElementById('edit-email-btn');
  const sendEmailBtn = document.getElementById('send-email-btn');
  
  // API base URL
  const API_BASE_URL = 'http://localhost:3000/api';
  
  // Navigation
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remove active class from all links
      navLinks.forEach(l => l.classList.remove('active'));
      
      // Add active class to clicked link
      link.classList.add('active');
      
      // Hide all sections
      Object.values(sections).forEach(section => {
        section.classList.add('hidden');
      });
      
      // Show the target section
      const targetId = link.getAttribute('href').substring(1);
      document.getElementById(targetId).classList.remove('hidden');
    });
  });
  
  // New Search button
  if (newSearchBtn) {
    newSearchBtn.addEventListener('click', () => {
      // Navigate to search section
      navLinks.forEach(l => l.classList.remove('active'));
      document.querySelector('a[href="#search"]').classList.add('active');
      
      // Hide all sections and show search
      Object.values(sections).forEach(section => {
        section.classList.add('hidden');
      });
      sections.search.classList.remove('hidden');
      
      // Clear previous search results
      searchResults.classList.add('hidden');
      document.getElementById('niche-input').focus();
    });
  }
  
  // Search button
  if (searchBtn) {
    searchBtn.addEventListener('click', async () => {
      const niche = document.getElementById('niche-input').value.trim();
      const limit = document.getElementById('limit-input').value;
      const drThreshold = document.getElementById('dr-threshold').value;
      
      if (!niche) {
        alert('Please enter a niche to search for');
        return;
      }
      
      // Show loading state
      searchBtn.disabled = true;
      searchBtn.textContent = 'Searching...';
      
      try {
        // This would make an actual API call in production
        // const response = await fetch(`${API_BASE_URL}/search`, {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json'
        //   },
        //   body: JSON.stringify({ niche, limit })
        // });
        // const data = await response.json();
        
        // For demo purposes, we'll use mock data
        const mockData = await getMockSearchResults(niche, limit);
        
        // Display search results
        displaySearchResults(mockData.websites, drThreshold);
        
        // Show search results section
        searchResults.classList.remove('hidden');
        
      } catch (error) {
        console.error('Search error:', error);
        alert('Error performing search. Please try again.');
      } finally {
        // Reset button state
        searchBtn.disabled = false;
        searchBtn.textContent = 'Search';
      }
    });
  }
  
  // Save All button
  if (saveAllBtn) {
    saveAllBtn.addEventListener('click', () => {
      alert('All websites saved to database!');
      
      // Navigate to dashboard
      navLinks.forEach(l => l.classList.remove('active'));
      document.querySelector('a[href="#dashboard"]').classList.add('active');
      
      // Hide all sections and show dashboard
      Object.values(sections).forEach(section => {
        section.classList.add('hidden');
      });
      sections.dashboard.classList.remove('hidden');
      
      // Update dashboard stats (mock)
      updateDashboardStats();
    });
  }
  
  // Email All button
  if (emailAllBtn) {
    emailAllBtn.addEventListener('click', () => {
      // Get all websites with DR above threshold
      const drThreshold = document.getElementById('dr-threshold').value;
      const websites = Array.from(searchResultsTable.querySelectorAll('tr'))
        .filter(row => {
          const dr = parseInt(row.querySelector('td:nth-child(2)').textContent);
          return dr >= drThreshold;
        })
        .map(row => {
          return {
            domain: row.querySelector('td:nth-child(1)').textContent,
            dr: parseInt(row.querySelector('td:nth-child(2)').textContent),
            email: row.querySelector('td:nth-child(3)').textContent
          };
        });
      
      if (websites.length === 0) {
        alert('No websites meet the DR threshold criteria.');
        return;
      }
      
      alert(`Emails will be sent to ${websites.length} websites!`);
      
      // Navigate to outreach
      navLinks.forEach(l => l.classList.remove('active'));
      document.querySelector('a[href="#outreach"]').classList.add('active');
      
      // Hide all sections and show outreach
      Object.values(sections).forEach(section => {
        section.classList.add('hidden');
      });
      sections.outreach.classList.remove('hidden');
    });
  }
  
  // Apply Filters button
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', () => {
      alert('Filters applied!');
      // In a real app, this would filter the outreach table
    });
  }
  
  // Save Settings button
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', () => {
      // Get all settings values
      const settings = {
        supabaseUrl: document.getElementById('supabase-url').value,
        supabaseKey: document.getElementById('supabase-key').value,
        resendKey: document.getElementById('resend-key').value,
        ahrefsKey: document.getElementById('ahrefs-key').value,
        openaiKey: document.getElementById('openai-key').value,
        drThreshold: document.getElementById('dr-threshold-setting').value,
        emailDelay: document.getElementById('email-delay').value,
        maxFollowups: document.getElementById('max-followups').value
      };
      
      // In a real app, this would save to localStorage or make an API call
      console.log('Saving settings:', settings);
      alert('Settings saved successfully!');
    });
  }
  
  // Email modal
  if (closeModal) {
    closeModal.addEventListener('click', () => {
      emailModal.classList.add('hidden');
    });
  }
  
  if (sendEmailBtn) {
    sendEmailBtn.addEventListener('click', () => {
      emailModal.classList.add('hidden');
      alert('Email sent successfully!');
    });
  }
  
  // Helper Functions
  
  // Display search results in the table
  function displaySearchResults(websites, drThreshold) {
    searchResultsTable.innerHTML = '';
    
    if (!websites || websites.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.className = 'empty-state';
      emptyRow.innerHTML = '<td colspan="4">No websites found. Try a different search term.</td>';
      searchResultsTable.appendChild(emptyRow);
      return;
    }
    
    websites.forEach(website => {
      const row = document.createElement('tr');
      
      // Add DR class based on threshold
      if (website.dr >= drThreshold) {
        row.classList.add('high-dr');
      }
      
      row.innerHTML = `
        <td>${website.domain}</td>
        <td>${website.dr}</td>
        <td>${website.email || 'Not found'}</td>
        <td>
          <button class="btn btn-secondary btn-sm view-btn" data-domain="${website.domain}">View</button>
          ${website.email ? `<button class="btn btn-primary btn-sm email-btn" data-domain="${website.domain}">Email</button>` : ''}
        </td>
      `;
      
      searchResultsTable.appendChild(row);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.email-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const domain = e.target.getAttribute('data-domain');
        const website = websites.find(w => w.domain === domain);
        
        if (website && website.email) {
          showEmailModal(website);
        }
      });
    });
  }
  
  // Show email modal with website data
  function showEmailModal(website) {
    emailTo.textContent = website.email;
    emailSubject.textContent = `Sponsored Post Opportunity on ${website.domain}`;
    emailBody.innerHTML = `
      <p>Hello,</p>
      
      <p>I hope this email finds you well. My name is [Your Name] from [Your Agency], and I came across your website ${website.domain} while researching quality blogs in your niche.</p>
      
      <p>I'm reaching out to inquire about sponsored post opportunities on your site. We're interested in publishing high-quality, relevant content that would provide value to your audience.</p>
      
      <p>Could you please share your rates for sponsored posts and any guidelines you have for this type of content?</p>
      
      <p>Looking forward to potentially working together.</p>
      
      <p>Best regards,<br>
      [Your Name]<br>
      [Your Agency]</p>
    `;
    
    emailModal.classList.remove('hidden');
  }
  
  // Update dashboard stats with mock data
  function updateDashboardStats() {
    document.querySelector('.stat-card:nth-child(1) .stat-number').textContent = '42';
    document.querySelector('.stat-card:nth-child(2) .stat-number').textContent = '18';
    document.querySelector('.stat-card:nth-child(3) .stat-number').textContent = '7';
    document.querySelector('.stat-card:nth-child(4) .stat-number').textContent = '3';
    
    // Update recent websites table
    const recentWebsitesTable = document.getElementById('recent-websites-table');
    recentWebsitesTable.innerHTML = `
      <tr>
        <td>example1.com</td>
        <td>45</td>
        <td>contact@example1.com</td>
        <td>Contacted</td>
        <td><button class="btn btn-secondary btn-sm">View</button></td>
      </tr>
      <tr>
        <td>example2.com</td>
        <td>38</td>
        <td>info@example2.com</td>
        <td>Replied</td>
        <td><button class="btn btn-secondary btn-sm">View</button></td>
      </tr>
      <tr>
        <td>example3.com</td>
        <td>52</td>
        <td>admin@example3.com</td>
        <td>Negotiating</td>
        <td><button class="btn btn-secondary btn-sm">View</button></td>
      </tr>
    `;
    
    // Update recent emails table
    const recentEmailsTable = document.getElementById('recent-emails-table');
    recentEmailsTable.innerHTML = `
      <tr>
        <td>example1.com</td>
        <td>Initial</td>
        <td>2 days ago</td>
        <td>Sent</td>
        <td><button class="btn btn-secondary btn-sm">View</button></td>
      </tr>
      <tr>
        <td>example2.com</td>
        <td>Initial</td>
        <td>3 days ago</td>
        <td>Replied</td>
        <td><button class="btn btn-secondary btn-sm">View</button></td>
      </tr>
      <tr>
        <td>example4.com</td>
        <td>Follow-up</td>
        <td>1 day ago</td>
        <td>Sent</td>
        <td><button class="btn btn-secondary btn-sm">View</button></td>
      </tr>
    `;
  }
  
  // Get mock search results
  async function getMockSearchResults(niche, limit) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockWebsites = [
      {
        domain: 'interiordesignblog.com',
        title: 'Interior Design Blog - Home Decor Ideas & Inspiration',
        url: 'https://interiordesignblog.com',
        snippet: 'Get inspired with our collection of interior design ideas, home decor tips, and room makeovers.',
        dr: 45,
        email: 'contact@interiordesignblog.com',
        contactPage: 'https://interiordesignblog.com/contact'
      },
      {
        domain: 'modernhomedesign.com',
        title: 'Modern Home Design - Contemporary Interior Design',
        url: 'https://modernhomedesign.com',
        snippet: 'Explore modern interior design ideas for your home. Find inspiration for contemporary living spaces.',
        dr: 38,
        email: 'info@modernhomedesign.com',
        contactPage: 'https://modernhomedesign.com/contact'
      },
      {
        domain: 'homedecortoday.com',
        title: 'Home Decor Today - Latest Trends in Interior Design',
        url: 'https://homedecortoday.com',
        snippet: 'Stay up to date with the latest trends in home decor and interior design.',
        dr: 52,
        email: 'editor@homedecortoday.com',
        contactPage: 'https://homedecortoday.com/contact'
      },
      {
        domain: 'designinspiration.net',
        title: 'Design Inspiration - Interior Design Ideas & Home Decor',
        url: 'https://designinspiration.net',
        snippet: 'Find inspiration for your next interior design project. Browse our collection of home decor ideas.',
        dr: 29,
        email: 'hello@designinspiration.net',
        contactPage: 'https://designinspiration.net/contact'
      },
      {
        domain: 'homestyling.com',
        title: 'Home Styling - Interior Design Tips & Tricks',
        url: 'https://homestyling.com',
        snippet: 'Learn how to style your home with our interior design tips and tricks.',
        dr: 41,
        email: 'contact@homestyling.com',
        contactPage: 'https://homestyling.com/contact'
      },
      {
        domain: 'decorideas.org',
        title: 'Decor Ideas - Interior Design Inspiration',
        url: 'https://decorideas.org',
        snippet: 'Get inspired with our collection of interior design ideas and home decor inspiration.',
        dr: 33,
        email: 'info@decorideas.org',
        contactPage: 'https://decorideas.org/contact'
      },
      {
        domain: 'interiorstyle.blog',
        title: 'Interior Style Blog - Home Decor & Design',
        url: 'https://interiorstyle.blog',
        snippet: 'A blog about interior design, home decor, and styling tips.',
        dr: 27,
        email: null,
        contactPage: 'https://interiorstyle.blog/about'
      },
      {
        domain: 'designyourhome.com',
        title: 'Design Your Home - Interior Design Resources',
        url: 'https://designyourhome.com',
        snippet: 'Resources and guides to help you design your home interior.',
        dr: 36,
        email: 'support@designyourhome.com',
        contactPage: 'https://designyourhome.com/contact'
      },
      {
        domain: 'homedesignlover.com',
        title: 'Home Design Lover - Interior Design Ideas',
        url: 'https://homedesignlover.com',
        snippet: 'A blog for people who love home design and interior decoration.',
        dr: 44,
        email: 'editor@homedesignlover.com',
        contactPage: 'https://homedesignlover.com/contact'
      },
      {
        domain: 'interiordesignmatters.com',
        title: 'Interior Design Matters - Home Decor Blog',
        url: 'https://interiordesignmatters.com',
        snippet: 'A blog about why interior design matters and how it affects our daily lives.',
        dr: 31,
        email: 'hello@interiordesignmatters.com',
        contactPage: 'https://interiordesignmatters.com/contact'
      }
    ];
    
    // Filter by niche (in a real app, this would be done by the API)
    const filteredWebsites = mockWebsites.filter(website => {
      const nicheTerms = niche.toLowerCase().split(' ');
      const websiteText = `${website.domain} ${website.title} ${website.snippet}`.toLowerCase();
      return nicheTerms.some(term => websiteText.includes(term));
    });
    
    // Limit results
    const limitedWebsites = filteredWebsites.slice(0, parseInt(limit));
    
    return {
      websites: limitedWebsites
    };
  }
});
