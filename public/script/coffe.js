
        // Create animated particles
        function createParticles() {
            const particlesContainer = document.getElementById('particles');
            const numberOfParticles = 50;

            for (let i = 0; i < numberOfParticles; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                const size = Math.random() * 6 + 2;
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * window.innerHeight;
                const delay = Math.random() * 6;
                
                particle.style.width = size + 'px';
                particle.style.height = size + 'px';
                particle.style.left = x + 'px';
                particle.style.top = y + 'px';
                particle.style.animationDelay = delay + 's';
                
                particlesContainer.appendChild(particle);
            }
        }

        // Language translations
        const translations = {
            en: {
                welcomeTitle: "Welcome",
                subtitle: "Please enter your information below",
                firstNameLabel: "First Name",
                lastNameLabel: "Last Name",
                submitButtonText: "Submit",
                successMessage: "Data saved successfully!",
                errorMessage: "Please fill in all fields",
                submittingText: "Submitting..."
            },
            ar: {
                welcomeTitle: "مرحباً",
                subtitle: "يرجى إدخال معلوماتك أدناه",
                firstNameLabel: "الاسم الأول",
                lastNameLabel: "الاسم الأخير", 
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
                showStatusMessage(texts.errorMessage, 'error');
                return;
            }

            // Show loading state
            submitButton.disabled = true;
            loadingSpinner.style.display = 'inline-block';
            submitButtonText.textContent = texts.submittingText;

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
    
                console.log('Success:', userData);
                showStatusMessage(texts.successMessage, 'success');
                makeBackgroundScroll();
                
            } catch (error) {
                console.error('Network error:', error);
                showStatusMessage('Network error: ' + error.message, 'error');
            } finally {
                submitButton.disabled = false;
                loadingSpinner.style.display = 'none';
                submitButtonText.textContent = texts.submitButtonText;
            }
        }

        function makeBackgroundScroll() {
            const formContainer = document.getElementById('formContainer');
            setTimeout(() => {
                formContainer.classList.add('hide');
            }, 1000);
        }

        function showStatusMessage(message, type) {
            const statusMessage = document.getElementById('statusMessage');
            statusMessage.textContent = message;
            statusMessage.className = `status-message ${type} show`;
            
            setTimeout(() => {
                statusMessage.classList.remove('show');
            }, 5000);
        }

        // Language switcher functionality
        function initializeLanguageSwitcher() {
            const languageButton = document.getElementById('languageButton');
            const languageDropdown = document.getElementById('languageDropdown');
            const languageOptions = document.querySelectorAll('.lang-option');

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

        function setLanguage(lang) {
            const texts = translations[lang];
            
            document.getElementById('welcomeTitle').textContent = texts.welcomeTitle;
            document.getElementById('subtitle').textContent = texts.subtitle;
            document.getElementById('firstNameLabel').textContent = texts.firstNameLabel;
            document.getElementById('lastNameLabel').textContent = texts.lastNameLabel;
            document.getElementById('submitButtonText').textContent = texts.submitButtonText;

            if (lang === 'ar') {
                document.documentElement.setAttribute('dir', 'rtl');
                document.documentElement.setAttribute('lang', 'ar');
            } else {
                document.documentElement.setAttribute('dir', 'ltr');
                document.documentElement.setAttribute('lang', 'en');
            }
            
            document.getElementById('languageDropdown').classList.remove('show');
        }

        // Initialize everything
        document.addEventListener('DOMContentLoaded', function() {
            createParticles();
            initializeLanguageSwitcher();
            document.getElementById('playerForm').addEventListener('submit', savePlayerData);
        });