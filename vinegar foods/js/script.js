
// ===== ADD TO CART SYSTEM =====

// Shopping Cart Class
class ShoppingCart {
    constructor() {
        // Initialize cart from localStorage or empty array
        this.cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        
        // DOM Elements
        this.cartIcon = document.getElementById('openCart');
        this.cartCount = document.getElementById('cartCount');
        this.cartSidebar = document.getElementById('cartSidebar');
        this.closeCartBtn = document.getElementById('closeCart');
        this.overlay = document.getElementById('overlay');
        this.cartItemsContainer = document.getElementById('cartItems');
        this.emptyCartMessage = document.getElementById('emptyCart');
        this.cartFooter = document.getElementById('cartFooter');
        this.cartTotalPrice = document.getElementById('cartTotalPrice');
        this.cartTax = document.getElementById('cartTax');
        this.cartGrandTotal = document.getElementById('cartGrandTotal');
        this.checkoutBtn = document.getElementById('checkoutBtn');
        this.continueShoppingBtn = document.getElementById('continueShopping');
        this.notification = document.getElementById('notification');
        this.notificationText = document.getElementById('notificationText');
        
        // Initialize the cart
        this.init();
    }
    
    init() {
        // Set up event listeners
        this.setupEventListeners();
        
        // Update cart display
        this.updateCartCount();
        this.renderCartItems();
    }
    
    setupEventListeners() {
        // Open cart
        this.cartIcon.addEventListener('click', () => this.openCart());
        
        // Close cart
        this.closeCartBtn.addEventListener('click', () => this.closeCart());
        this.overlay.addEventListener('click', () => this.closeCart());
        
        // Checkout button
        this.checkoutBtn.addEventListener('click', () => this.checkout());
        
        // Continue shopping button
        this.continueShoppingBtn.addEventListener('click', () => this.closeCart());
        
        // Add to cart buttons (using event delegation)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart-btn')) {
                const button = e.target.closest('.add-to-cart-btn');
                this.addItemToCart(button);
            }
        });
        
        // Cart item controls (using event delegation)
        this.cartItemsContainer.addEventListener('click', (e) => {
            // Decrease quantity
            if (e.target.closest('.decrease')) {
                const id = e.target.closest('.decrease').dataset.id;
                this.updateQuantity(id, -1);
            }
            
            // Increase quantity
            if (e.target.closest('.increase')) {
                const id = e.target.closest('.increase').dataset.id;
                this.updateQuantity(id, 1);
            }
            
            // Remove item
            if (e.target.closest('.remove-item')) {
                const id = e.target.closest('.remove-item').dataset.id;
                this.removeItemFromCart(id);
            }
        });
        
        // Close cart with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.cartSidebar.classList.contains('active')) {
                this.closeCart();
            }
        });
    }
    
    addItemToCart(button) {
        // Get item data from button attributes
        const id = button.dataset.id;
        const name = button.dataset.name;
        const price = parseFloat(button.dataset.price);
        const image = button.dataset.image;
        
        // Check if item already exists in cart
        const existingItem = this.cart.find(item => item.id === id);
        
        if (existingItem) {
            // Increase quantity if item exists
            existingItem.quantity += 1;
        } else {
            // Add new item to cart
            this.cart.push({
                id: id,
                name: name,
                price: price,
                image: image,
                quantity: 1
            });
        }
        
        // Save to localStorage
        this.saveCart();
        
        // Update UI
        this.updateCartCount();
        this.renderCartItems();
        
        // Show success notification
        this.showNotification(`${name} added to cart!`);
        
        // Open cart automatically
        this.openCart();
        
        // Button animation
        this.animateAddButton(button);
    }
    
    removeItemFromCart(id) {
        // Filter out the item to remove
        this.cart = this.cart.filter(item => item.id !== id);
        
        // Save to localStorage
        this.saveCart();
        
        // Update UI
        this.updateCartCount();
        this.renderCartItems();
        
        // Show notification
        this.showNotification('Item removed from cart');
    }
    
    updateQuantity(id, change) {
        // Find the item
        const item = this.cart.find(item => item.id === id);
        
        if (item) {
            // Update quantity
            item.quantity += change;
            
            // Remove if quantity is 0 or less
            if (item.quantity <= 0) {
                this.removeItemFromCart(id);
                return;
            }
            
            // Save to localStorage
            this.saveCart();
            
            // Update UI
            this.renderCartItems();
        }
    }
    
    saveCart() {
        localStorage.setItem('shoppingCart', JSON.stringify(this.cart));
    }
    
    updateCartCount() {
        // Calculate total items in cart
        const totalItems = this.cart.reduce((total, item) => total + item.quantity, 0);
        
        // Update cart count badge
        this.cartCount.textContent = totalItems;
        
        // Add animation if items were added
        if (totalItems > 0) {
            this.cartCount.style.transform = 'scale(1.2)';
            setTimeout(() => {
                this.cartCount.style.transform = 'scale(1)';
            }, 300);
        }
    }
    
    renderCartItems() {
        // Clear current items
        this.cartItemsContainer.innerHTML = '';
        
        if (this.cart.length === 0) {
            // Show empty cart message
            this.emptyCartMessage.style.display = 'block';
            this.cartFooter.style.display = 'none';
            return;
        }
        
        // Hide empty cart message
        this.emptyCartMessage.style.display = 'none';
        this.cartFooter.style.display = 'block';
        
        let subtotal = 0;
        
        // Render each cart item
        this.cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                        <span class="item-quantity">${item.quantity}</span>
                        <button class="quantity-btn increase" data-id="${item.id}">+</button>
                        <button class="remove-item" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            this.cartItemsContainer.appendChild(cartItem);
        });
        
        // Calculate totals
        const tax = subtotal * 0.10; // 10% tax
        const grandTotal = subtotal + tax;
        
        // Update totals display
        this.cartTotalPrice.textContent = `$${subtotal.toFixed(2)}`;
        this.cartTax.textContent = `$${tax.toFixed(2)}`;
        this.cartGrandTotal.textContent = `$${grandTotal.toFixed(2)}`;
    }
    
    openCart() {
        this.cartSidebar.classList.add('active');
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeCart() {
        this.cartSidebar.classList.remove('active');
        this.overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    checkout() {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty!');
            return;
        }
        
        // Calculate total
        const subtotal = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const tax = subtotal * 0.10;
        const total = subtotal + tax;
        
        // Show checkout confirmation
        this.showNotification('Proceeding to checkout...');
        
        // In a real application, you would redirect to a checkout page
        // For demo purposes, we'll show a confirmation
        setTimeout(() => {
            if (confirm(`Order Total: $${total.toFixed(2)}\n\nProceed with payment?`)) {
                // Process order (in real app, this would call your backend)
                alert('Thank you for your order! Your food will be prepared soon.');
                
                // Clear cart
                this.cart = [];
                this.saveCart();
                this.updateCartCount();
                this.renderCartItems();
                this.closeCart();
            }
        }, 1000);
    }
    
    showNotification(message) {
        this.notificationText.textContent = message;
        this.notification.classList.add('show');
        
        // Auto-hide notification after 3 seconds
        setTimeout(() => {
            this.notification.classList.remove('show');
        }, 3000);
    }
    
    animateAddButton(button) {
        const originalText = button.innerHTML;
        
        // Change button to show success
        button.innerHTML = '<i class="fas fa-check"></i> Added!';
        button.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
        
        // Revert after 1.5 seconds
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
        }, 1500);
    }
    
    // Public method to clear cart (can be called from other scripts)
    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartCount();
        this.renderCartItems();
        this.showNotification('Cart cleared');
    }
    
    // Public method to get cart data (can be called from other scripts)
    getCartData() {
        return this.cart;
    }
    
    // Public method to get cart total (can be called from other scripts)
    getCartTotal() {
        const subtotal = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const tax = subtotal * 0.10;
        return subtotal + tax;
    }
}

// Initialize the shopping cart when page loads
let shoppingCart;

document.addEventListener('DOMContentLoaded', function() {
    shoppingCart = new ShoppingCart();
    
    // Example: Programmatically add item to cart
    // shoppingCart.addItem({
    //     id: '100',
    //     name: 'Special Pizza',
    //     price: 25.99,
    //     image: 'pizza.jpg'
    // });
    
    // Example: Clear cart
    // shoppingCart.clearCart();
    
    // Example: Get cart data
    // console.log(shoppingCart.getCartData());
    
    // Example: Get cart total
    // console.log(shoppingCart.getCartTotal());
});



// Navbar scroll effect
        window.addEventListener('scroll', function() {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
        
        // Menu filtering functionality
        document.addEventListener('DOMContentLoaded', function() {
            const filterButtons = document.querySelectorAll('.menu-filter-btn');
            const menuItems = document.querySelectorAll('.menu-item');
            
            filterButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // Remove active class from all buttons
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    
                    // Add active class to clicked button
                    this.classList.add('active');
                    
                    const filterValue = this.getAttribute('data-filter');
                    
                    menuItems.forEach(item => {
                        if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                            item.style.display = 'block';
                        } else {
                            item.style.display = 'none';
                        }
                    });
                });
            });
            
            // Smooth scrolling for anchor links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const targetId = this.getAttribute('href');
                    if (targetId === '#') return;
                    
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - 80,
                            behavior: 'smooth'
                        });
                        
                        // Close mobile navbar if open
                        const navbarToggler = document.querySelector('.navbar-toggler');
                        const navbarCollapse = document.querySelector('.navbar-collapse');
                        if (!navbarToggler.classList.contains('collapsed')) {
                            navbarToggler.click();
                        }
                    }
                });
            });
        });


          // ===== SHOPPING CART SYSTEM =====
        // Duplicate ShoppingCart class removed to avoid redeclaration and allow menu filtering code to run

        // ===== MENU FILTERING =====
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize shopping cart once (reuse existing instance if available)
            if (typeof shoppingCart === 'undefined' || !shoppingCart) {
                window.shoppingCart = new ShoppingCart();
            } else {
                window.shoppingCart = shoppingCart;
            }
            
            // Menu filtering
            const categoryButtons = document.querySelectorAll('.category-btn');
            // Select the column wrappers that actually carry the data-category attribute
            const menuCards = document.querySelectorAll('#menuItemsContainer > [data-category]');
            
            categoryButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // Remove active class from all buttons
                    categoryButtons.forEach(btn => btn.classList.remove('active'));
                    
                    // Add active class to clicked button
                    this.classList.add('active');
                    
                    const filterValue = this.getAttribute('data-category');
                    
                    // Filter menu items by showing/hiding their column wrappers
                    menuCards.forEach(card => {
                        const itemCategory = card.getAttribute('data-category');

                        if (filterValue === 'all' || itemCategory === filterValue) {
                            card.style.display = '';
                            const inner = card.querySelector('.menu-item');
                            if (inner) {
                                inner.style.animation = 'none';
                                setTimeout(() => {
                                    inner.style.animation = 'fadeIn 0.5s forwards';
                                }, 10);
                            }
                        } else {
                            card.style.display = 'none';
                        }
                    });
                });
            });
            
            // Add CSS animation for fade in
            const style = document.createElement('style');
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `;
            document.head.appendChild(style);
        });
        // Book a Table Functionality
document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('bookingForm');
    const submitBtn = document.getElementById('submitBooking');
    const formMessage = document.querySelector('.form-message');
    const successModal = new bootstrap.Modal(document.getElementById('bookingSuccessModal'));
    
    // Set minimum date to today
    const dateInput = document.getElementById('date');
    const today = new Date();
    const maxDate = new Date();
    maxDate.setMonth(today.getMonth() + 3);
    
    dateInput.min = formatDate(today);
    dateInput.max = formatDate(maxDate);
    
    // Format date to YYYY-MM-DD
    function formatDate(date) {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();
        
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        
        return [year, month, day].join('-');
    }
    
    // Form validation
    function validateForm() {
        let isValid = true;
        const requiredFields = bookingForm.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('is-invalid');
                isValid = false;
            } else {
                field.classList.remove('is-invalid');
                field.classList.add('is-valid');
            }
            
            // Email validation
            if (field.type === 'email' && field.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(field.value)) {
                    field.classList.add('is-invalid');
                    field.classList.remove('is-valid');
                    isValid = false;
                }
            }
            
            // Phone validation
            if (field.id === 'phone' && field.value) {
                const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                const cleanedPhone = field.value.replace(/\D/g, '');
                if (!phoneRegex.test(cleanedPhone)) {
                    field.classList.add('is-invalid');
                    field.classList.remove('is-valid');
                    isValid = false;
                }
            }
        });
        
        return isValid;
    }
    
    // Show form message
    function showMessage(type, text) {
        formMessage.className = `form-message ${type}`;
        formMessage.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>${text}`;
        formMessage.style.display = 'block';
        
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    }
    
    // Format phone number
    function formatPhoneNumber(phone) {
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return '+1 (' + match[2] + ') ' + match[3] + '-' + match[4];
        }
        return phone;
    }
    
    // Format date for display
    function formatDateForDisplay(dateString) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
    
    // Get time slot label
    function getTimeLabel(time) {
        const timeLabels = {
            '11:00': '11:00 AM',
            '12:00': '12:00 PM',
            '13:00': '1:00 PM',
            '14:00': '2:00 PM',
            '18:00': '6:00 PM',
            '18:30': '6:30 PM',
            '19:00': '7:00 PM',
            '19:30': '7:30 PM',
            '20:00': '8:00 PM',
            '20:30': '8:30 PM',
            '21:00': '9:00 PM'
        };
        return timeLabels[time] || time;
    }
    
    // Get table type label
    function getTableTypeLabel(type) {
        const labels = {
            'indoor': 'Indoor Dining',
            'outdoor': 'Outdoor Terrace',
            'private': 'Private Room',
            'counter': "Chef's Counter"
        };
        return labels[type] || type;
    }
    
    // Handle form submission
    bookingForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            showMessage('error', 'Please fill all required fields correctly.');
            return;
        }
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.querySelector('.btn-text').classList.add('d-none');
        submitBtn.querySelector('.btn-loading').classList.remove('d-none');
        
        // Get form data
        const formData = {
            name: document.getElementById('fullName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: formatPhoneNumber(document.getElementById('phone').value),
            guests: document.getElementById('guests').value,
            date: document.getElementById('date').value,
            time: document.getElementById('time').value,
            specialRequests: document.getElementById('specialRequests').value,
            tableType: document.querySelector('input[name="tableType"]:checked').value,
            bookingDate: new Date().toISOString(),
            reference: 'VINE-' + Date.now().toString().slice(-6)
        };
        
        try {
            // In a real application, you would send this data to your server
            // For demo purposes, we'll simulate an API call
            
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
            
            // Store booking data in localStorage for demo
            const bookings = JSON.parse(localStorage.getItem('vinegarBookings') || '[]');
            bookings.push(formData);
            localStorage.setItem('vinegarBookings', JSON.stringify(bookings));
            
            // Update success modal with booking details
            document.getElementById('modalDateTime').textContent = 
                `${formatDateForDisplay(formData.date)} at ${getTimeLabel(formData.time)}`;
            document.getElementById('modalGuests').textContent = 
                `${formData.guest} ${formData.guest === '1' ? 'Person' : 'People'} (${getTableTypeLabel(formData.tableType)})`;
            
            // Show success modal
            successModal.show();
            
            // Reset form
            bookingForm.reset();
            bookingForm.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));
            
            // Send confirmation email (simulated)
            simulateEmailConfirmation(formData);
            
        } catch (error) {
            console.error('Booking error:', error);
            showMessage('error', 'Something went wrong. Please try again or call us directly.');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            submitBtn.querySelector('.btn-text').classList.remove('d-none');
            submitBtn.querySelector('.btn-loading').classList.add('d-none');
        }
    });
    
    // Simulate email confirmation
    function simulateEmailConfirmation(bookingData) {
        console.log('Sending confirmation email to:', bookingData.email);
        console.log('Booking details:', bookingData);
        
        // In a real application, you would send an email via your backend
        // Example using EmailJS or your own email service
    }
    
    // Real-time validation
    bookingForm.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('blur', function() {
            if (this.hasAttribute('required')) {
                if (!this.value.trim()) {
                    this.classList.add('is-invalid');
                    this.classList.remove('is-valid');
                } else {
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                }
            }
            
            // Real-time email validation
            if (this.type === 'email' && this.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(this.value)) {
                    this.classList.add('is-invalid');
                    this.classList.remove('is-valid');
                } else {
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                }
            }
        });
        
        field.addEventListener('input', function() {
            if (this.value.trim()) {
                this.classList.remove('is-invalid');
            }
        });
    });
    
    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            value = value.match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
            e.target.value = !value[2] ? value[1] : '(' + value[1] + ') ' + value[2] + (value[3] ? '-' + value[3] : '');
        }
    });
    
    // Disable past dates
    dateInput.addEventListener('change', function() {
        const selectedDate = new Date(this.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            this.value = formatDate(today);
            showMessage('error', 'Please select a future date.');
        }
    });
    
    // Time slot availability check (simulated)
    document.getElementById('time').addEventListener('change', function() {
        const selectedDate = dateInput.value;
        const selectedTime = this.value;
        
        if (selectedDate && selectedTime) {
            // Simulate checking availability
            const fullyBookedTimes = ['19:00', '20:00']; // Simulated fully booked times
            
            if (fullyBookedTimes.includes(selectedTime)) {
                showMessage('error', 'This time slot is fully booked. Please select another time.');
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            }
        }
    });
    
    // Auto-fill for demo purposes (remove in production)
    function setupDemoFill() {
        const demoBtn = document.createElement('button');
        demoBtn.type = 'button';
        demoBtn.className = 'btn btn-outline-secondary btn-sm mt-3';
        demoBtn.innerHTML = '<i class="fas fa-magic me-2"></i>Fill Demo Data';
        demoBtn.onclick = function() {
            document.getElementById('fullName').value = 'John Smith';
            document.getElementById('email').value = 'john@example.com';
            document.getElementById('phone').value = '(123) 456-7890';
            document.getElementById('guests').value = '2';
            document.getElementById('date').value = formatDate(new Date(Date.now() + 86400000)); // Tomorrow
            document.getElementById('time').value = '19:00';
            document.getElementById('specialRequests').value = 'Celebrating anniversary, gluten-free options needed.';
            
            // Trigger validation
            bookingForm.querySelectorAll('input, select, textarea').forEach(field => {
                if (field.value) {
                    field.classList.add('is-valid');
                    field.classList.remove('is-invalid');
                }
            });
            
            showMessage('success', 'Demo data filled. You can now submit the form.');
        };
        
        bookingForm.appendChild(demoBtn);
    }
    
    // Uncomment to enable demo fill button
    // setupDemoFill();
    
    // Initialize tooltips for info icons
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});



 


