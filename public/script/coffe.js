  // Language translations
        const translations = {
            en: {
                welcomeTitle: "Welcome",
                subtitle: "Please enter your information below",
                firstNameLabel: "Full Name",
                lastNameLabel: "Email address",
                submitButtonText: "Submit",
                successMessage: "Data saved successfully!",
                errorMessage: "Please fill in all fields",
                submittingText: "Submitting..."
            },
            ar: {
                welcomeTitle: "مرحباً",
                subtitle: "يرجى إدخال معلوماتك أدناه",
                firstNameLabel: "الاسم كامل",
                lastNameLabel: "البريد الالكتروني",
                submitButtonText: "إرسال",
                successMessage: "تم حفظ البيانات بنجاح!",
                errorMessage: "يرجى ملء جميع الحقول",
                submittingText: "جاري الإرسال..."
            }
        };

        // Form submission handler
        async function savePlayerData(event) {
            event.preventDefault();

            const submitButton = document.getElementById('submitButton');
            const submitButtonText = document.getElementById('submitButtonText');
            const loadingSpinner = document.getElementById('loadingSpinner');
            const statusMessage = document.getElementById('statusMessage');

            const firstName = document.getElementById('firstNameInput').value.trim();
            const lastName = document.getElementById('lastNameInput').value.trim();

            const currentLang = document.documentElement.lang || 'en';
            const texts = translations[currentLang];

            if (!firstName || !lastName) {
                showStatus(texts.errorMessage, 'error');
                return;
            }

            // Show loading state
            submitButton.disabled = true;
            submitButtonText.textContent = texts.submittingText;
            loadingSpinner.style.display = 'inline-block';

            const userData = {
                firstName: firstName,
                lastName: lastName,
                timestamp: new Date().toISOString()
            };

            try {
                const response = await fetch('/api/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        data: userData
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    console.log('Success:', result);
                    showStatus(texts.successMessage, 'success');
                    
                    // Clear form fields
                    document.getElementById('firstNameInput').value = '';
                    document.getElementById('lastNameInput').value = '';
                    
                    makeBackgroundScroll();
                } else {
                    console.error('Error:', result);
                    showStatus('Error saving data: ' + result.error, 'error');
                }
            } catch (error) {
                console.error('Network error:', error);
                showStatus('Network error: ' + error.message, 'error');
            } finally {
                // Re-enable submit button
                submitButton.disabled = false;
                submitButtonText.textContent = texts.submitButtonText;
                loadingSpinner.style.display = 'none';
            }
        }

        function makeBackgroundScroll() {
           const formContainer = document.getElementById('mainContainer');
            const bg = document.getElementById('bgImage');

            if (formContainer && bg) {
                // Hide the form container with animation
                formContainer.classList.add('hide');
                
                // Add scroll animation to background
                bg.classList.add('bgScroll');
                
                console.log('Background scroll animation started');
            } else {
                console.error('Elements not found:', { formContainer, bg });
            }
        }

        // Helper function for status messages
        function showStatus(message, type) {
            const statusElement = document.getElementById('statusMessage');
            statusElement.textContent = message;
            statusElement.className = `status-message ${type} show`;
            
            setTimeout(() => {
                statusElement.classList.remove('show');
            }, 5000);
        }

        // Language switcher functionality
        function initializeLanguageSwitcher() {
            const languageButton = document.getElementById('languageButton');
            const languageDropdown = document.getElementById('languageDropdown');
            const languageOptions = document.querySelectorAll('.lang-option');

            if (languageButton && languageDropdown) {
                languageButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    languageDropdown.classList.toggle('show');
                });

                window.addEventListener('click', (event) => {
                    if (!languageButton.contains(event.target)) {
                        languageDropdown.classList.remove('show');
                    }
                });

                languageOptions.forEach(option => {
                    option.addEventListener('click', (event) => {
                        event.preventDefault();
                        const selectedLang = option.getAttribute('data-lang');
                        setLanguage(selectedLang);
                    });
                });
            }
        }

        function setLanguage(lang) {
             const texts = translations[lang];
            const bgImage = document.getElementById('bgImage');
            
            // Update background image based on language - preserve existing classes
            bgImage.classList.remove('en', 'ar');
            bgImage.classList.add(lang);

            // Update text content
            document.getElementById('welcomeTitle').textContent = texts.welcomeTitle;
            document.getElementById('subtitle').textContent = texts.subtitle;
            document.getElementById('firstNameLabel').textContent = texts.firstNameLabel;
            document.getElementById('lastNameLabel').textContent = texts.lastNameLabel;
            document.getElementById('submitButtonText').textContent = texts.submitButtonText;

            // Update document language and direction
            if (lang === 'ar') {
                document.documentElement.setAttribute('dir', 'rtl');
                document.documentElement.setAttribute('lang', 'ar');
            } else {
                document.documentElement.setAttribute('dir', 'ltr');
                document.documentElement.setAttribute('lang', 'en');
            }

            // Close dropdown
            document.getElementById('languageDropdown').classList.remove('show');
        }

        // Initialize everything
        document.addEventListener('DOMContentLoaded', function () {
            initializeLanguageSwitcher();
            document.getElementById('playerForm').addEventListener('submit', savePlayerData);
            
            // Set initial language to English
            setLanguage('en');
        });