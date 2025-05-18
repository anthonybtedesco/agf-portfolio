document.addEventListener('DOMContentLoaded', function() {
  // Make sure all cards are visible after DOM content is loaded
  const existingCards = document.querySelectorAll('.project-card');
  existingCards.forEach(card => {
    card.style.opacity = '1';
  });
  loadProjects();
  setupModal();
  initializeDarkModeToggle();
  enhanceHeaderAnimation();
  setupProjectsAnimation();
});

function initializeDarkModeToggle() {
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (darkModeToggle) {
    // Check for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.body.classList.add('dark-theme');
      darkModeToggle.checked = true;
    }

    // Add event listener for theme toggle
    darkModeToggle.addEventListener('change', function() {
      if (this.checked) {
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
      }
    });
  }
}

function setupProjectsAnimation() {
  // Create intersection observer to trigger animations when projects come into view
  const projectsSection = document.querySelector('.projects');
  
  if (!projectsSection) return;
  
  const observerOptions = {
    root: null, // viewport
    rootMargin: '0px 0px -100px 0px', // Trigger slightly before element comes into view
    threshold: 0.1 // Trigger when 10% of the element is visible
  };
  
  // Animation for individual cards
  const animateProjectCards = (cards) => {
    // Calculate the number of columns based on viewport width
    const containerWidth = projectsSection.clientWidth;
    const cardWidth = 300; // Approximate width of a card including gap
    const columnsCount = Math.floor(containerWidth / cardWidth) || 1;
    
    cards.forEach((card, index) => {
      // Calculate row and column of the card
      const column = index % columnsCount;
      const row = Math.floor(index / columnsCount);
      
      // Stagger delay based on both column and row for a diagonal cascade effect
      const delay = (column * 0.1) + (row * 0.1);
      
      // Ensure card is visible initially, but ready for animation
      card.style.opacity = '1';
      
      // Apply animation with delay
      card.style.animationDelay = `${delay}s`;
    });
  };
  
  const projectsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // When projects section comes into view, animate the cards
        const projectCards = document.querySelectorAll('.project-card');
        animateProjectCards(projectCards);
        
        // Once animation is triggered, disconnect the observer
        observer.disconnect();
      }
    });
  }, observerOptions);
  
  // Start observing the projects section
  projectsObserver.observe(projectsSection);
  
  // If the window is resized, update the animation on visible cards
  window.addEventListener('resize', () => {
    const visibleCards = document.querySelectorAll('.project-card');
    if (visibleCards.length > 0) {
      // Only reanimate if cards are already visible
      animateProjectCards(visibleCards);
    }
  });
}

function loadProjects() {
  // Show loader
  const loader = document.querySelector('.projects-loader');
  if (loader) {
    loader.classList.add('active');
  }
  
  // Animate intro section
  const intro = document.querySelector('.intro');
  if (intro) {
    intro.classList.add('animate');
  }
  
  fetch('projects.json')
    .then(response => response.json())
    .then(projects => {
      const projectsGrid = document.querySelector('.projects-grid');
      projectsGrid.innerHTML = '';
      
      projects.forEach((project, index) => {
        const projectCard = createProjectCard(project);
        
        // Make sure cards are visible by default
        projectCard.style.opacity = '1';
        
        projectsGrid.appendChild(projectCard);
      });
      
      // Hide loader when projects are loaded
      if (loader) {
        setTimeout(() => {
          loader.classList.remove('active');
        }, 500);
      }
      
      // Add a backup to ensure all cards are visible after a delay
      setTimeout(() => {
        const allCards = document.querySelectorAll('.project-card');
        allCards.forEach(card => {
          card.style.opacity = '1';
          card.style.visibility = 'visible';
        });
      }, 1000);
    })
    .catch(error => {
      console.error('Error loading projects:', error);
      document.querySelector('.projects-grid').innerHTML = '<p>Error loading projects. Please try again later.</p>';
      
      // Hide loader on error
      if (loader) {
        loader.classList.remove('active');
      }
    });
}

function createProjectCard(project) {
  const card = document.createElement('div');
  card.className = 'project-card';
  
  const previewSection = document.createElement('div');
  previewSection.className = 'project-preview';
  
  // Create a mini browser frame for the preview
  const browserFrame = document.createElement('div');
  browserFrame.className = 'browser-frame';
  
  // Create browser controls
  const browserControls = document.createElement('div');
  browserControls.className = 'browser-controls';
  
  // Add browser dots
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('span');
    dot.className = 'browser-dot';
    browserControls.appendChild(dot);
  }
  
  // Add fake address bar
  const addressBar = document.createElement('div');
  addressBar.className = 'browser-address';
  addressBar.textContent = project.url;
  browserControls.appendChild(addressBar);
  
  browserFrame.appendChild(browserControls);
  
  // Create placeholder background with random color based on project name
  const placeholderBg = document.createElement('div');
  placeholderBg.className = 'placeholder-bg';
  placeholderBg.style.backgroundColor = getRandomColor(project.name);
  
  // Create project initial or icon
  const initialElement = document.createElement('div');
  initialElement.className = 'project-initial';
  initialElement.textContent = project.name.charAt(0);
  
  // Add content to browser frame
  const browserContent = document.createElement('div');
  browserContent.className = 'browser-content';
  browserContent.appendChild(placeholderBg);
  browserContent.appendChild(initialElement);
  
  // We'll also try to load an image if available
  if (project.image) {
    const img = document.createElement('img');
    img.className = 'project-image';
    img.src = project.image;
    img.alt = project.name;
    console.log(project.image);
    img.onerror = function() {
      // If image fails to load, show the placeholder
      this.style.display = 'none';
    };
    browserContent.appendChild(img);
  }
  
  browserFrame.appendChild(browserContent);
  previewSection.appendChild(browserFrame);
  
  const infoSection = document.createElement('div');
  infoSection.className = 'project-info';
  
  const title = document.createElement('h3');
  title.className = 'project-title';
  title.textContent = project.name;
  
  const description = document.createElement('p');
  description.className = 'project-description';
  description.textContent = project.description;
  
  // Add tech badges if available
  if (project.technologies && project.technologies.length > 0) {
    const techBadges = document.createElement('div');
    techBadges.className = 'tech-badges';
    
    project.technologies.forEach(tech => {
      const badge = document.createElement('span');
      badge.className = 'tech-badge';
      badge.textContent = tech;
      techBadges.appendChild(badge);
    });
    
    infoSection.appendChild(title);
    infoSection.appendChild(description);
    infoSection.appendChild(techBadges);
  } else {
    infoSection.appendChild(title);
    infoSection.appendChild(description);
  }
  
  const link = document.createElement('a');
  link.className = 'project-link';
  link.href = '#';
  link.textContent = 'Live Preview';
  link.addEventListener('click', function(e) {
    e.preventDefault();
    openProjectModal(project);
  });
  
  infoSection.appendChild(link);
  
  card.appendChild(previewSection);
  card.appendChild(infoSection);
  
  // Add interaction effects
  card.addEventListener('mouseenter', function() {
    this.classList.add('hovering');
  });
  
  card.addEventListener('mouseleave', function() {
    this.classList.remove('hovering');
  });
  
  return card;
}

function getRandomColor(str) {
  // Generate a color based on the project name for consistency
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Create pastel colors by adjusting the saturation and lightness
  const h = hash % 360;
  return `hsl(${h}, 70%, 80%)`;
}

function setupModal() {
  const modal = document.querySelector('.modal');
  const closeButton = document.querySelector('.close-modal');
  const modalContent = document.querySelector('.modal-content');
  
  if (closeButton) {
    closeButton.addEventListener('click', function() {
      closeModal();
    });
  }
  
  // Close modal when clicking outside of modal content
  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      closeModal();
    }
  });
  
  // Close modal with Escape key
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      closeModal();
    }
  });
  
  // Add buttons for responsive views
  const viewButtons = document.createElement('div');
  viewButtons.className = 'modal-view-buttons';
  
  const views = [
    { name: 'Desktop', icon: 'fa-desktop', width: '100%' },
    { name: 'Tablet', icon: 'fa-tablet-alt', width: '768px' },
    { name: 'Mobile', icon: 'fa-mobile-alt', width: '375px' }
  ];
  
  views.forEach(view => {
    const button = document.createElement('button');
    button.className = 'view-button';
    button.innerHTML = `<i class="fas ${view.icon}"></i>`;
    button.title = view.name;
    button.addEventListener('click', function() {
      const iframe = document.querySelector('.modal-iframe');
      iframe.style.width = view.width;
      
      // Reset all buttons to inactive
      document.querySelectorAll('.view-button').forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Mark this button as active
      this.classList.add('active');
    });
    
    // Desktop view is active by default
    if (view.name === 'Desktop') {
      button.classList.add('active');
    }
    
    viewButtons.appendChild(button);
  });
  
  // Add the view buttons to the modal
  modalContent.insertBefore(viewButtons, modalContent.firstChild);
}

function openProjectModal(project) {
  const modal = document.querySelector('.modal');
  const modalIframe = document.querySelector('.modal-iframe');
  const projectTitle = document.querySelector('.modal-project-title');
  
  if (projectTitle) {
    projectTitle.textContent = project.name;
    
    // Add tech badges to the title if available
    const existingBadges = document.querySelector('.modal-tech-badges');
    if (existingBadges) {
      existingBadges.remove();
    }
    
    if (project.technologies && project.technologies.length > 0) {
      const techBadges = document.createElement('div');
      techBadges.className = 'tech-badges modal-tech-badges';
      
      project.technologies.forEach(tech => {
        const badge = document.createElement('span');
        badge.className = 'tech-badge';
        badge.textContent = tech;
        techBadges.appendChild(badge);
      });
      
      projectTitle.insertAdjacentElement('afterend', techBadges);
    }
  }
  
  // Show loading state
  modal.classList.add('loading');
  modalIframe.src = 'about:blank';
  modal.style.display = 'block';
  
  // Set a short timeout to ensure the modal is visible before loading the iframe
  setTimeout(() => {
    modalIframe.src = project.url;
    
    // Reset to desktop view
    document.querySelectorAll('.view-button').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector('.view-button:first-child').classList.add('active');
    modalIframe.style.width = '100%';
    
    // Remove loading state when iframe loads
    modalIframe.onload = function() {
      modal.classList.remove('loading');
    };
  }, 100);
  
  // Prevent scrolling on the body when modal is open
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.querySelector('.modal');
  const modalIframe = document.querySelector('.modal-iframe');
  
  modal.style.display = 'none';
  modalIframe.src = 'about:blank';
  
  // Re-enable scrolling on the body
  document.body.style.overflow = '';
}

function enhanceHeaderAnimation() {
  const header = document.querySelector('header');
  const particles = document.querySelector('.header-particles');
  
  if (!header || !particles) return;
  
  // Add more dynamic particles
  for (let i = 0; i < 8; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle dynamic-particle';
    
    // Random size between 10px and 40px
    const size = Math.floor(Math.random() * 30) + 10;
    
    // Random position
    const posX = Math.floor(Math.random() * 100);
    const posY = Math.floor(Math.random() * 100);
    
    // Random opacity
    const opacity = (Math.random() * 0.05) + 0.02;
    
    // Random rotation
    const rotation = Math.floor(Math.random() * 45);
    
    // Apply styles
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${posX}%`;
    particle.style.top = `${posY}%`;
    particle.style.opacity = opacity;
    particle.style.transform = `rotate(${rotation}deg)`;
    
    // Determine shape (circle, square or diamond)
    const shapeType = Math.floor(Math.random() * 3);
    if (shapeType === 0) {
      particle.style.borderRadius = '50%';
    } else if (shapeType === 1) {
      particle.style.borderRadius = '4px';
    } else {
      particle.style.borderRadius = '4px';
      particle.style.transform = `rotate(45deg)`;
    }
    
    // Random animation duration between 15s and 30s
    const duration = Math.floor(Math.random() * 15) + 15;
    particle.style.animation = `floating ${duration}s infinite linear ${Math.random() < 0.5 ? 'reverse' : ''}`;
    
    particles.appendChild(particle);
  }
  
  // Add parallax effect
  window.addEventListener('mousemove', function(e) {
    if (window.innerWidth < 768) return; // Disable on mobile
    
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    const depth = 20; // Movement amount
    const moveX = (mouseX - 0.5) * depth;
    const moveY = (mouseY - 0.5) * depth;
    
    // Apply to different particles at different rates for parallax effect
    const allParticles = document.querySelectorAll('.particle');
    allParticles.forEach((particle, index) => {
      const depthFactor = ((index % 5) + 1) / 5; // 0.2, 0.4, 0.6, 0.8, 1.0
      particle.style.transform = particle.style.transform.includes('rotate') ? 
        `translate(${moveX * depthFactor}px, ${moveY * depthFactor}px) rotate(45deg)` : 
        `translate(${moveX * depthFactor}px, ${moveY * depthFactor}px)`;
    });
  });
} 