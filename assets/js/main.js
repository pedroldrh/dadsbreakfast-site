/**
 * Dad's Breakfast -- Main JavaScript
 * Standalone HTML/CSS/JS site. Buy buttons link to Shopify product pages.
 */


/* =======================================================================
   10. Image Gallery
   ======================================================================= */

function initGallery() {
  var mainImg = document.querySelector('.gallery__main img');
  var thumbs = document.querySelectorAll('.gallery__thumb');
  if (!mainImg || !thumbs.length) return;

  thumbs.forEach(function(thumb) {
    thumb.addEventListener('click', function() {
      var newSrc = thumb.querySelector('img').src;
      mainImg.src = newSrc;
      mainImg.alt = thumb.querySelector('img').alt;
      thumbs.forEach(function(t) { t.classList.remove('gallery__thumb--active'); });
      thumb.classList.add('gallery__thumb--active');
    });
  });
}


/* =======================================================================
   13. Reviews System
   ======================================================================= */

function getReviews(productId) {
  try {
    return JSON.parse(localStorage.getItem('dadsbreakfast_reviews_' + productId) || '[]');
  } catch (e) {
    return [];
  }
}

function saveReview(productId, review) {
  var reviews = getReviews(productId);
  reviews.unshift(review); // newest first
  localStorage.setItem('dadsbreakfast_reviews_' + productId, JSON.stringify(reviews));
}

function getAverageRating(productId) {
  var reviews = getReviews(productId);
  if (reviews.length === 0) return 0;
  var sum = reviews.reduce(function(acc, r) { return acc + r.rating; }, 0);
  return (sum / reviews.length).toFixed(1);
}

function renderStars(rating, size) {
  size = size || 18;
  var html = '<div class="stars">';
  for (var i = 1; i <= 5; i++) {
    var cls = i <= Math.round(rating) ? 'star--filled' : 'star--empty';
    html += '<svg class="' + cls + '" width="' + size + '" height="' + size + '" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
  }
  html += '</div>';
  return html;
}

function escapeHtml(str) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function renderReviews(productId) {
  var container = document.getElementById('reviews-list');
  var avgEl = document.getElementById('reviews-avg');
  var countEl = document.getElementById('reviews-count');
  if (!container) return;

  var reviews = getReviews(productId);
  var avg = getAverageRating(productId);

  if (avgEl) avgEl.innerHTML = renderStars(avg) + '<span class="reviews__avg-score">' + (avg > 0 ? avg : '\u2014') + '</span>';
  if (countEl) countEl.textContent = reviews.length + ' review' + (reviews.length !== 1 ? 's' : '');

  if (reviews.length === 0) {
    container.innerHTML = '<p style="color:var(--color-text-light);text-align:center;padding:2rem 0;">No reviews yet. Be the first to review this product!</p>';
    return;
  }

  var html = '';
  reviews.forEach(function(r) {
    html += '<div class="review-card">';
    html += '<div class="review-card__header">';
    html += '<div><span class="review-card__name">' + escapeHtml(r.name) + '</span> ' + renderStars(r.rating, 14) + '</div>';
    html += '<span class="review-card__date">' + r.date + '</span>';
    html += '</div>';
    html += '<p class="review-card__text">' + escapeHtml(r.text) + '</p>';
    html += '</div>';
  });
  container.innerHTML = html;
}

function initReviewForm() {
  var form = document.getElementById('review-form');
  if (!form) return;
  var productId = form.dataset.productId;
  var selectedRating = 0;

  // Star rating input
  var starInput = form.querySelector('.star-input');
  if (starInput) {
    var stars = starInput.querySelectorAll('svg');
    stars.forEach(function(star, idx) {
      star.addEventListener('mouseenter', function() {
        stars.forEach(function(s, i) {
          s.classList.toggle('active', i <= idx);
        });
      });
      star.addEventListener('click', function() {
        selectedRating = idx + 1;
        stars.forEach(function(s, i) {
          s.classList.toggle('active', i <= idx);
        });
      });
    });
    starInput.addEventListener('mouseleave', function() {
      stars.forEach(function(s, i) {
        s.classList.toggle('active', i < selectedRating);
      });
    });
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var nameField = form.querySelector('[name="reviewer-name"]');
    var textField = form.querySelector('[name="review-text"]');

    if (!nameField.value.trim()) { nameField.focus(); return; }
    if (!textField.value.trim()) { textField.focus(); return; }
    if (selectedRating === 0) { alert('Please select a star rating.'); return; }

    var review = {
      name: nameField.value.trim(),
      text: textField.value.trim(),
      rating: selectedRating,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    };

    saveReview(productId, review);
    renderReviews(productId);
    form.reset();
    selectedRating = 0;
    if (starInput) {
      starInput.querySelectorAll('svg').forEach(function(s) { s.classList.remove('active'); });
    }

    // Show thank you
    var msg = document.createElement('div');
    msg.style.cssText = 'padding:1rem;background:var(--color-accent-pink);border-radius:var(--radius-md);margin-bottom:1rem;text-align:center;font-weight:600;';
    msg.textContent = 'Thank you for your review!';
    form.prepend(msg);
    setTimeout(function() { msg.remove(); }, 3000);
  });

  renderReviews(productId);
}


/* =======================================================================
   DOMContentLoaded -- Initialize everything
   ======================================================================= */

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
    if (e.key === 'Escape') {
      if (mobileNav && mobileNav.classList.contains('mobile-nav--open')) {
        closeMobileMenu();
      }
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

  function showFormMessage(formEl, message, isError) {
    var existing = formEl.parentNode.querySelector('.form-message');
    if (existing) {
      existing.remove();
    }

    var msgEl = document.createElement('div');
    msgEl.className = 'form-message' + (isError ? ' form-message--error' : ' form-message--success');
    msgEl.setAttribute('role', isError ? 'alert' : 'status');
    msgEl.textContent = message;

    formEl.parentNode.insertBefore(msgEl, formEl.nextSibling);

    if (!isError) {
      setTimeout(function () {
        if (msgEl.parentNode) {
          msgEl.remove();
        }
      }, 6000);
    }
  }

  function isValidEmail(email) {
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  function showFieldError(field, message) {
    clearFieldError(field);

    field.classList.add('field--error');

    var errorEl = document.createElement('span');
    errorEl.className = 'field-error-message';
    errorEl.setAttribute('role', 'alert');
    errorEl.textContent = message;

    field.parentNode.insertBefore(errorEl, field.nextSibling);
  }

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

      var allFields = contactForm.querySelectorAll('input, textarea, select');
      allFields.forEach(function (f) {
        clearFieldError(f);
      });

      var existingMsg = contactForm.parentNode.querySelector('.form-message');
      if (existingMsg) {
        existingMsg.remove();
      }

      var nameField = contactForm.querySelector('[name="name"]');
      var emailField = contactForm.querySelector('[name="email"]');

      var isValid = true;

      if (nameField && nameField.value.trim() === '') {
        showFieldError(nameField, 'Name is required.');
        isValid = false;
      }

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

      var actionUrl = contactForm.dataset.action || contactForm.getAttribute('data-action');

      if (actionUrl) {
        var formData = new FormData(contactForm);

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

    var formInputs = contactForm.querySelectorAll('input, textarea, select');
    formInputs.forEach(function (field) {
      field.addEventListener('input', function () {
        clearFieldError(field);
      });
    });
  }


  /* =======================================================================
     6. Current Year in Footer
     ======================================================================= */
  var yearElements = document.querySelectorAll('[data-year]');
  var currentYear = new Date().getFullYear();
  yearElements.forEach(function (el) {
    el.textContent = currentYear;
  });


  /* =======================================================================
     Initialize features that depend on DOM
     ======================================================================= */

  // Image Gallery
  initGallery();

  // Reviews
  initReviewForm();

});
