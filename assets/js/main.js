/**
 * Dad's Breakfast -- Main JavaScript
 * Standalone HTML/CSS/JS site with Shopify Buy Button SDK integration.
 */

/* =======================================================================
   7. Product Data & Cart System (localStorage-based)
   ======================================================================= */

var PRODUCTS = {
  'date-coconut': {
    id: 'date-coconut',
    name: 'Date Coconut Granola',
    price: 8.00,
    image: 'assets/images/IMG_8291.jpeg',
    url: 'date-coconut.html'
  },
  'cherry-cacao': {
    id: 'cherry-cacao',
    name: 'Cherry Cacao Granola',
    price: 8.00,
    image: 'assets/images/Coop.jpeg',
    url: 'cherry-cacao.html'
  }
};

function getCart() {
  try {
    return JSON.parse(localStorage.getItem('dadsbreakfast_cart')) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('dadsbreakfast_cart', JSON.stringify(cart));
}

function addToCart(productId, qty) {
  var product = PRODUCTS[productId];
  if (!product) return;
  qty = qty || 1;
  var cart = getCart();
  var found = false;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id === productId) {
      cart[i].quantity += qty;
      found = true;
      break;
    }
  }
  if (!found) {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      url: product.url,
      quantity: qty
    });
  }
  saveCart(cart);
  updateCartBadge();
}

function removeFromCart(productId) {
  var cart = getCart();
  cart = cart.filter(function(item) { return item.id !== productId; });
  saveCart(cart);
  updateCartBadge();
}

function updateQuantity(productId, qty) {
  if (qty <= 0) {
    removeFromCart(productId);
    return;
  }
  var cart = getCart();
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id === productId) {
      cart[i].quantity = qty;
      break;
    }
  }
  saveCart(cart);
  updateCartBadge();
}

function getCartTotal() {
  var cart = getCart();
  var total = 0;
  for (var i = 0; i < cart.length; i++) {
    total += cart[i].price * cart[i].quantity;
  }
  return total;
}

function getCartCount() {
  var cart = getCart();
  var count = 0;
  for (var i = 0; i < cart.length; i++) {
    count += cart[i].quantity;
  }
  return count;
}

function updateCartBadge() {
  var badge = document.getElementById('cart-badge');
  if (!badge) return;
  var count = getCartCount();
  badge.textContent = count > 0 ? count : '';
  badge.style.display = count > 0 ? '' : 'none';
}


/* =======================================================================
   8. Cart Drawer
   ======================================================================= */

function openCart() {
  var drawer = document.getElementById('cart-drawer');
  var overlay = document.getElementById('cart-overlay');
  if (!drawer || !overlay) return;
  drawer.classList.add('cart-drawer--open');
  overlay.classList.add('cart-overlay--visible');
  drawer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
  renderCart();
}

function closeCart() {
  var drawer = document.getElementById('cart-drawer');
  var overlay = document.getElementById('cart-overlay');
  if (!drawer || !overlay) return;
  drawer.classList.remove('cart-drawer--open');
  overlay.classList.remove('cart-overlay--visible');
  drawer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
}

function renderCart() {
  var itemsContainer = document.getElementById('cart-items');
  var footerContainer = document.getElementById('cart-footer');
  if (!itemsContainer || !footerContainer) return;

  var cart = getCart();

  if (cart.length === 0) {
    itemsContainer.innerHTML =
      '<div style="text-align:center;padding:3rem 1rem;">' +
      '<p style="font-size:1.125rem;margin-bottom:1rem;color:var(--color-text-light);">Your cart is empty.</p>' +
      '<a href="index.html" class="btn btn--primary" style="display:inline-block;">Continue Shopping</a>' +
      '</div>';
    footerContainer.innerHTML = '';
    updateCartBadge();
    return;
  }

  var html = '';
  cart.forEach(function(item) {
    html += '<div class="cart-item" data-product-id="' + item.id + '">';
    html += '<a href="' + item.url + '" class="cart-item__image"><img src="' + item.image + '" alt="' + item.name + '" width="64" height="64"></a>';
    html += '<div class="cart-item__details">';
    html += '<a href="' + item.url + '" class="cart-item__name">' + item.name + '</a>';
    html += '<span class="cart-item__price">$' + (item.price * item.quantity).toFixed(2) + '</span>';
    html += '<div class="qty-selector qty-selector--small">';
    html += '<button type="button" data-qty-minus aria-label="Decrease quantity"' + (item.quantity <= 1 ? ' disabled' : '') + '>&minus;</button>';
    html += '<span class="qty-selector__value">' + item.quantity + '</span>';
    html += '<button type="button" data-qty-plus aria-label="Increase quantity">+</button>';
    html += '</div>';
    html += '</div>';
    html += '<button type="button" class="cart-item__remove" data-remove-item="' + item.id + '" aria-label="Remove ' + item.name + '">';
    html += '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    html += '</button>';
    html += '</div>';
  });
  itemsContainer.innerHTML = html;

  var total = getCartTotal();
  var footerHtml = '';
  footerHtml += '<div class="cart-drawer__subtotal"><span>Subtotal</span><span>$' + total.toFixed(2) + '</span></div>';
  footerHtml += '<p class="cart-drawer__shipping">$5.95 flat rate &middot; Free over $30</p>';
  footerHtml += '<button type="button" class="btn btn--primary cart-drawer__checkout" id="cart-checkout-btn">Checkout</button>';
  footerHtml += '<p class="cart-drawer__alt-pay">Or pay with Venmo/Zelle &mdash; email <a href="mailto:dadsbreakfastgranola@gmail.com">dadsbreakfastgranola@gmail.com</a></p>';
  footerContainer.innerHTML = footerHtml;

  // Bind remove buttons
  var removeBtns = itemsContainer.querySelectorAll('[data-remove-item]');
  removeBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      removeFromCart(btn.dataset.removeItem);
      renderCart();
    });
  });

  // Bind quantity selectors inside cart
  initQuantitySelectors(itemsContainer);

  // Bind checkout button
  var checkoutBtn = document.getElementById('cart-checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
      handleCheckout();
    });
  }

  updateCartBadge();
}


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
   11. Quantity Selector
   ======================================================================= */

function initQuantitySelectors(scope) {
  var root = scope || document;
  var selectors = root.querySelectorAll('.qty-selector');
  selectors.forEach(function(sel) {
    var minusBtn = sel.querySelector('[data-qty-minus]');
    var plusBtn = sel.querySelector('[data-qty-plus]');
    var valueEl = sel.querySelector('.qty-selector__value');
    if (!minusBtn || !plusBtn || !valueEl) return;

    minusBtn.addEventListener('click', function() {
      var val = parseInt(valueEl.textContent) || 1;
      if (val > 1) {
        valueEl.textContent = val - 1;
        // If this is a cart qty selector, update cart
        var cartItem = sel.closest('.cart-item');
        var cartItemId = cartItem && cartItem.dataset.productId;
        if (cartItemId) { updateQuantity(cartItemId, val - 1); renderCart(); }
      }
      minusBtn.disabled = (parseInt(valueEl.textContent) <= 1);
    });

    plusBtn.addEventListener('click', function() {
      var val = parseInt(valueEl.textContent) || 1;
      if (val < 99) {
        valueEl.textContent = val + 1;
        var cartItem = sel.closest('.cart-item');
        var cartItemId = cartItem && cartItem.dataset.productId;
        if (cartItemId) { updateQuantity(cartItemId, val + 1); renderCart(); }
      }
      minusBtn.disabled = false;
    });

    minusBtn.disabled = (parseInt(valueEl.textContent) <= 1);
  });
}


/* =======================================================================
   12. Add to Cart Button
   ======================================================================= */

function initAddToCart() {
  var addBtns = document.querySelectorAll('[data-add-to-cart]');
  addBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var productId = btn.dataset.addToCart;
      var productActions = btn.closest('.product-actions');
      var qtySel = productActions && productActions.querySelector('.qty-selector__value');
      var qty = qtySel ? parseInt(qtySel.textContent) || 1 : 1;
      addToCart(productId, qty);
      openCart();
      // Brief button feedback
      var origText = btn.textContent;
      btn.textContent = 'Added!';
      btn.disabled = true;
      setTimeout(function() { btn.textContent = origText; btn.disabled = false; }, 1500);
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
   14. Stripe Checkout (optional)
   ======================================================================= */

function handleCheckout() {
  if (window.STRIPE_KEY && window.STRIPE_PRICES) {
    var cart = getCart();
    if (cart.length === 0) return;

    // Load Stripe.js if not already loaded
    if (typeof Stripe === 'undefined') {
      var script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = function() {
        stripeRedirect(cart);
      };
      script.onerror = function() {
        alert('Failed to load payment processor. Please try again or email dadsbreakfastgranola@gmail.com to order.');
      };
      document.head.appendChild(script);
    } else {
      stripeRedirect(cart);
    }
  } else {
    alert('Online checkout coming soon! Email dadsbreakfastgranola@gmail.com to order.');
  }
}

function stripeRedirect(cart) {
  var stripe = Stripe(window.STRIPE_KEY);
  var lineItems = [];
  cart.forEach(function(item) {
    var priceId = window.STRIPE_PRICES[item.id];
    if (priceId) {
      lineItems.push({ price: priceId, quantity: item.quantity });
    }
  });
  if (lineItems.length === 0) {
    alert('Could not process these items. Email dadsbreakfastgranola@gmail.com to order.');
    return;
  }
  stripe.redirectToCheckout({
    lineItems: lineItems,
    mode: 'payment',
    successUrl: window.location.origin + '/checkout-success.html',
    cancelUrl: window.location.href
  }).then(function(result) {
    if (result.error) {
      alert(result.error.message);
    }
  });
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

  // Close on Escape key (mobile menu + cart drawer)
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (mobileNav && mobileNav.classList.contains('mobile-nav--open')) {
        closeMobileMenu();
      }
      var cartDrawer = document.getElementById('cart-drawer');
      if (cartDrawer && cartDrawer.classList.contains('cart-drawer--open')) {
        closeCart();
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


  /* =======================================================================
     8b. Inject Cart Drawer HTML & Cart Icon
     ======================================================================= */

  // Inject cart drawer into body
  var cartDrawerHTML =
    '<div class="cart-overlay" id="cart-overlay"></div>' +
    '<div class="cart-drawer" id="cart-drawer" aria-hidden="true">' +
    '  <div class="cart-drawer__header">' +
    '    <h2>Your Cart</h2>' +
    '    <button class="cart-drawer__close" id="cart-drawer-close" aria-label="Close cart">' +
    '      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
    '    </button>' +
    '  </div>' +
    '  <div class="cart-drawer__items" id="cart-items"></div>' +
    '  <div class="cart-drawer__footer" id="cart-footer"></div>' +
    '</div>';
  document.body.insertAdjacentHTML('beforeend', cartDrawerHTML);

  // Bind cart drawer close button and overlay
  var cartDrawerCloseBtn = document.getElementById('cart-drawer-close');
  var cartOverlay = document.getElementById('cart-overlay');

  if (cartDrawerCloseBtn) {
    cartDrawerCloseBtn.addEventListener('click', function() {
      closeCart();
    });
  }

  if (cartOverlay) {
    cartOverlay.addEventListener('click', function() {
      closeCart();
    });
  }

  /* =======================================================================
     9. Cart Icon in Header
     ======================================================================= */
  var headerActions = document.querySelector('.header__actions');
  if (headerActions) {
    var cartBtnHTML =
      '<button class="header__cart" id="cart-toggle" aria-label="Open cart">' +
      '  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>' +
      '    <line x1="3" y1="6" x2="21" y2="6"/>' +
      '    <path d="M16 10a4 4 0 01-8 0"/>' +
      '  </svg>' +
      '  <span class="header__cart-badge" id="cart-badge"></span>' +
      '</button>';
    headerActions.insertAdjacentHTML('afterbegin', cartBtnHTML);

    var cartToggleBtn = document.getElementById('cart-toggle');
    if (cartToggleBtn) {
      cartToggleBtn.addEventListener('click', function() {
        openCart();
      });
    }
  }

  // Initialize cart badge on page load
  updateCartBadge();


  /* =======================================================================
     Initialize new features that depend on DOM
     ======================================================================= */

  // 10. Image Gallery
  initGallery();

  // 11. Quantity Selectors (page-level, not cart)
  initQuantitySelectors();

  // 12. Add to Cart Buttons
  initAddToCart();

  // 13. Reviews
  initReviewForm();

});
