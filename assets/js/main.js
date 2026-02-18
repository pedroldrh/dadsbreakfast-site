/**
 * Dad's Breakfast -- Main JavaScript
 * Standalone HTML/CSS/JS site with Shopify Buy Button SDK integration.
 */

document.addEventListener('DOMContentLoaded', function () {

  /* =======================================================================
     1. Mobile Menu Toggle
     ======================================================================= */
  var menuToggle = document.querySelector('[data-mobile-menu-toggle]');
  var menuClose = document.querySelector('[data-mobile-menu-close]');
  var mobileNav = document.querySelector('.mobile-nav');

  function openMobileMenu() {
    if (!mobileNav || !menuToggle) return;
    mobileNav.classList.add('mobile-nav--open');
    document.body.classList.add('no-scroll');
    menuToggle.setAttribute('aria-expanded', 'true');
    mobileNav.setAttribute('aria-hidden', 'false');

    // Focus the close button (or first focusable element) when menu opens
    var firstFocusable = mobileNav.querySelector(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }

  function closeMobileMenu() {
    if (!mobileNav || !menuToggle) return;
    mobileNav.classList.remove('mobile-nav--open');
    document.body.classList.remove('no-scroll');
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');

    // Restore focus to the toggle button
    menuToggle.focus();
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      var isOpen = mobileNav && mobileNav.classList.contains('mobile-nav--open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (menuClose) {
    menuClose.addEventListener('click', function () {
      closeMobileMenu();
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileNav && mobileNav.classList.contains('mobile-nav--open')) {
      closeMobileMenu();
    }
  });

  // Focus trap inside mobile nav
  if (mobileNav) {
    mobileNav.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      if (!mobileNav.classList.contains('mobile-nav--open')) return;

      var focusableSelectors =
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      var focusableElements = Array.prototype.slice.call(
        mobileNav.querySelectorAll(focusableSelectors)
      );

      if (focusableElements.length === 0) return;

      var firstEl = focusableElements[0];
      var lastEl = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: if on first element, wrap to last
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        // Tab: if on last element, wrap to first
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    });

    // Auto-close when a nav link inside the mobile nav is clicked
    var mobileNavLinks = mobileNav.querySelectorAll('a');
    for (var i = 0; i < mobileNavLinks.length; i++) {
      mobileNavLinks[i].addEventListener('click', function () {
        closeMobileMenu();
      });
    }
  }


  /* =======================================================================
     2. Intersection Observer -- Scroll Animations
     ======================================================================= */
  var animateElements = document.querySelectorAll('.animate-in');

  if ('IntersectionObserver' in window) {
    var animateObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in--visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    animateElements.forEach(function (el) {
      animateObserver.observe(el);
    });
  } else {
    // Fallback: make all elements visible immediately
    animateElements.forEach(function (el) {
      el.classList.add('animate-in--visible');
    });
  }


  /* =======================================================================
     3. Smooth Scroll for Anchor Links
     ======================================================================= */
  var anchorLinks = document.querySelectorAll('a[href^="#"]');
  var stickyHeader = document.querySelector('header') || document.querySelector('.site-header');

  anchorLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = link.getAttribute('href');

      // Skip if href is only "#" or empty
      if (!href || href === '#') return;

      var target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      var headerOffset = 0;
      if (stickyHeader) {
        headerOffset = stickyHeader.offsetHeight;
      }

      var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });

      // Update the URL hash without jumping
      if (history.pushState) {
        history.pushState(null, null, href);
      }
    });
  });


  /* =======================================================================
     4. Contact Form Handling
     ======================================================================= */
  var contactForm = document.getElementById('contact-form');

  /**
   * Display a message (success or error) near the form.
   * Inserts or replaces a .form-message element immediately after the form.
   */
  function showFormMessage(formEl, message, isError) {
    // Remove any existing message
    var existing = formEl.parentNode.querySelector('.form-message');
    if (existing) {
      existing.remove();
    }

    var msgEl = document.createElement('div');
    msgEl.className = 'form-message' + (isError ? ' form-message--error' : ' form-message--success');
    msgEl.setAttribute('role', isError ? 'alert' : 'status');
    msgEl.textContent = message;

    // Insert right after the form
    formEl.parentNode.insertBefore(msgEl, formEl.nextSibling);

    // Auto-remove success messages after 6 seconds
    if (!isError) {
      setTimeout(function () {
        if (msgEl.parentNode) {
          msgEl.remove();
        }
      }, 6000);
    }
  }

  /**
   * Validate an email address format.
   */
  function isValidEmail(email) {
    // Standard email regex: local@domain.tld
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  /**
   * Show an inline error message for a specific field.
   */
  function showFieldError(field, message) {
    // Remove any prior error on this field
    clearFieldError(field);

    field.classList.add('field--error');

    var errorEl = document.createElement('span');
    errorEl.className = 'field-error-message';
    errorEl.setAttribute('role', 'alert');
    errorEl.textContent = message;

    // Insert the error message right after the field
    field.parentNode.insertBefore(errorEl, field.nextSibling);
  }

  /**
   * Clear inline error for a specific field.
   */
  function clearFieldError(field) {
    field.classList.remove('field--error');
    var existingError = field.parentNode.querySelector('.field-error-message');
    if (existingError) {
      existingError.remove();
    }
  }

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Clear all previous field errors
      var allFields = contactForm.querySelectorAll('input, textarea, select');
      allFields.forEach(function (f) {
        clearFieldError(f);
      });

      // Remove any previous form-level message
      var existingMsg = contactForm.parentNode.querySelector('.form-message');
      if (existingMsg) {
        existingMsg.remove();
      }

      // Gather fields
      var nameField = contactForm.querySelector('[name="name"]');
      var emailField = contactForm.querySelector('[name="email"]');

      var isValid = true;

      // Validate name
      if (nameField && nameField.value.trim() === '') {
        showFieldError(nameField, 'Name is required.');
        isValid = false;
      }

      // Validate email
      if (emailField) {
        var emailVal = emailField.value.trim();
        if (emailVal === '') {
          showFieldError(emailField, 'Email is required.');
          isValid = false;
        } else if (!isValidEmail(emailVal)) {
          showFieldError(emailField, 'Please enter a valid email address.');
          isValid = false;
        }
      }

      if (!isValid) return;

      // Determine submission endpoint
      var actionUrl = contactForm.dataset.action || contactForm.getAttribute('data-action');

      if (actionUrl) {
        // POST via fetch to the form service endpoint
        var formData = new FormData(contactForm);

        // Disable submit button while sending
        var submitBtn = contactForm.querySelector('[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Sending...';
        }

        fetch(actionUrl, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
          },
        })
          .then(function (response) {
            if (response.ok) {
              showFormMessage(contactForm, 'Thank you! Your message has been sent.', false);
              contactForm.reset();
            } else {
              return response.json().then(function (data) {
                var errorText = (data && data.error) ? data.error : 'Something went wrong. Please try again.';
                showFormMessage(contactForm, errorText, true);
              });
            }
          })
          .catch(function () {
            showFormMessage(contactForm, 'Network error. Please check your connection and try again.', true);
          })
          .finally(function () {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Send Message';
            }
          });
      } else {
        // Fallback: open a mailto link
        var name = nameField ? nameField.value.trim() : '';
        var email = emailField ? emailField.value.trim() : '';
        var messageField = contactForm.querySelector('[name="message"]');
        var message = messageField ? messageField.value.trim() : '';

        var subject = encodeURIComponent("Contact from " + name);
        var body = encodeURIComponent("Name: " + name + "\nEmail: " + email + "\n\n" + message);

        window.location.href = 'mailto:?subject=' + subject + '&body=' + body;
        showFormMessage(contactForm, 'Opening your email client...', false);
        contactForm.reset();
      }
    });

    // Clear field errors on input
    var formInputs = contactForm.querySelectorAll('input, textarea, select');
    formInputs.forEach(function (field) {
      field.addEventListener('input', function () {
        clearFieldError(field);
      });
    });
  }


  /* =======================================================================
     5. Shopify Buy Button Integration Helper
     ======================================================================= */

  /*
   * To set up:
   * 1. In Shopify admin, go to Sales Channels > Buy Button
   * 2. Create a Buy Button for your product or collection
   * 3. Copy the domain and storefront access token
   * 4. Set them in the HTML:
   *    <div id="shopify-buy"
   *         data-domain="your-store.myshopify.com"
   *         data-token="your-storefront-access-token">
   *    </div>
   *
   * For individual products, add containers like:
   *    <div data-shopify-product-id="PRODUCT_GID_NUMBER"></div>
   *
   * For collections:
   *    <div data-shopify-collection-id="COLLECTION_GID_NUMBER"></div>
   */

  function initShopifyBuyButton() {
    var buyContainer = document.getElementById('shopify-buy');
    if (!buyContainer) return;

    var domain = buyContainer.dataset.domain;
    var token = buyContainer.dataset.token;

    if (!domain || !token) {
      // Show setup message when credentials are not yet configured
      buyContainer.innerHTML =
        '<div style="text-align:center;padding:3rem;background:var(--color-bg-soft);border-radius:var(--radius-lg);">' +
        '<p style="font-size:1.125rem;font-weight:600;margin-bottom:0.5rem;">Shop Coming Soon</p>' +
        '<p style="color:var(--color-text-light);">Shopify Buy Button will be configured here. See README for setup instructions.</p>' +
        '</div>';
      return;
    }

    // Load Shopify Buy Button SDK script
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
    script.onload = function () {
      initBuyComponents(domain, token);
    };
    script.onerror = function () {
      buyContainer.innerHTML =
        '<div style="text-align:center;padding:2rem;color:#c00;">' +
        '<p>Failed to load the Shopify Buy Button SDK. Please refresh or try again later.</p>' +
        '</div>';
    };
    document.head.appendChild(script);
  }

  function initBuyComponents(domain, token) {
    var client = ShopifyBuy.buildClient({
      domain: domain,
      storefrontAccessToken: token,
    });

    ShopifyBuy.UI.onReady(client).then(function (ui) {
      // --- Individual product embeds ---
      var productEls = document.querySelectorAll('[data-shopify-product-id]');
      productEls.forEach(function (el) {
        ui.createComponent('product', {
          id: el.dataset.shopifyProductId,
          node: el,
          moneyFormat: '${{amount}}',
          options: {
            product: {
              styles: {
                product: {
                  '@media (min-width: 601px)': {
                    'max-width': '100%',
                  },
                },
                button: {
                  'background-color': '#1a1a1a',
                  'border-radius': '8px',
                  'font-family':
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  'font-weight': '600',
                  'padding': '14px 32px',
                  ':hover': {
                    'background-color': '#333333',
                  },
                },
                price: {
                  'font-weight': '700',
                  'font-size': '1.25rem',
                },
                title: {
                  'font-family':
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  'font-weight': '700',
                },
              },
              text: {
                button: 'Add to Cart',
              },
            },
            cart: {
              styles: {
                button: {
                  'background-color': '#1a1a1a',
                  'border-radius': '8px',
                  'font-weight': '600',
                  ':hover': {
                    'background-color': '#333333',
                  },
                },
              },
              text: {
                total: 'Subtotal',
                button: 'Checkout',
              },
            },
            toggle: {
              styles: {
                toggle: {
                  'background-color': '#1a1a1a',
                },
                count: {
                  'font-size': '12px',
                },
              },
            },
          },
        });
      });

      // --- Collection embeds ---
      var collectionEls = document.querySelectorAll('[data-shopify-collection-id]');
      collectionEls.forEach(function (el) {
        ui.createComponent('collection', {
          id: el.dataset.shopifyCollectionId,
          node: el,
          moneyFormat: '${{amount}}',
          options: {
            product: {
              styles: {
                product: {
                  'flex': '0 0 calc(33.333% - 20px)',
                  '@media (max-width: 750px)': {
                    'flex': '0 0 calc(50% - 10px)',
                  },
                },
                button: {
                  'background-color': '#1a1a1a',
                  'border-radius': '8px',
                  'font-weight': '600',
                  ':hover': {
                    'background-color': '#333333',
                  },
                },
              },
              text: {
                button: 'Add to Cart',
              },
            },
            cart: {
              styles: {
                button: {
                  'background-color': '#1a1a1a',
                  'border-radius': '8px',
                  ':hover': {
                    'background-color': '#333333',
                  },
                },
              },
            },
            toggle: {
              styles: {
                toggle: {
                  'background-color': '#1a1a1a',
                },
              },
            },
          },
        });
      });
    });
  }

  initShopifyBuyButton();


  /* =======================================================================
     6. Current Year in Footer
     ======================================================================= */
  var yearElements = document.querySelectorAll('[data-year]');
  var currentYear = new Date().getFullYear();
  yearElements.forEach(function (el) {
    el.textContent = currentYear;
  });

});
