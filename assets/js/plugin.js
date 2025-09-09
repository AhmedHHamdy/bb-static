document.addEventListener('DOMContentLoaded', function () {
    const timeSlotsContainer = document.getElementById('time-slots');
    const monthLabel = document.getElementById('calendar-month-label');
    const calendarGrid = document.getElementById('calendar-grid');
    const prevBtn = document.getElementById('cal-prev');
    const nextBtn = document.getElementById('cal-next');
    const nextActionBtn = document.getElementById('consultation-next-btn');

    if (!timeSlotsContainer || !monthLabel || !calendarGrid || !prevBtn || !nextBtn || !nextActionBtn) {
        return;
    }

    const availableTimeSlots = [
        '09:00 - 09:30 ( BST )',
        '10:00 - 10:30 ( BST )',
        '11:00 - 11:30 ( BST )',
        '12:00 - 12:30 ( BST )',
        '13:00 - 13:30 ( BST )',
    ];

    let selectedTimeSlot = null;
    let selectedDate = null; // stores a Date object
    let viewYear;
    let viewMonth; // 0-11

    const today = new Date();
    viewYear = today.getFullYear();
    viewMonth = today.getMonth();

    function formatMonthYearArabic(year, monthIndex) {
        const date = new Date(year, monthIndex, 1);
        try {
            return new Intl.DateTimeFormat('ar', { month: 'long', year: 'numeric' }).format(date);
        } catch (e) {
            // Fallback
            const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
            return months[monthIndex] + ' ' + year;
        }
    }

    function isSameDate(a, b) {
        return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    }

    function renderTimeSlots() {
        timeSlotsContainer.innerHTML = '';
        availableTimeSlots.forEach((slot) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = slot;
            btn.className = [
                'w-full','h-[59px]','border','border-[#DADADA]','rounded-lg','text-[16px]','font-medium','text-black',
                'hover:bg-[#FCF4E9]','transition-colors'
            ].join(' ');

            if (selectedTimeSlot === slot) {
                btn.classList.add('active-btn');
            }

            btn.addEventListener('click', () => {
                selectedTimeSlot = slot;
                // remove active from siblings
                [...timeSlotsContainer.querySelectorAll('button')].forEach(b => b.classList.remove('active-btn'));
                btn.classList.add('active-btn');
                maybeEnableNext();
            });

            timeSlotsContainer.appendChild(btn);
        });
    }

    function renderCalendar(year, monthIndex) {
        monthLabel.textContent = formatMonthYearArabic(year, monthIndex);
        calendarGrid.innerHTML = '';

        const firstOfMonth = new Date(year, monthIndex, 1);
        const firstDayIndex = firstOfMonth.getDay(); // 0 Sun .. 6 Sat
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();

        // Leading days (from previous month)
        for (let i = 0; i < firstDayIndex; i++) {
            const dayNum = daysInPrevMonth - firstDayIndex + 1 + i;
            const cell = createDayCell(dayNum, year, monthIndex - 1, true);
            calendarGrid.appendChild(cell);
        }

        // Current month days
        for (let d = 1; d <= daysInMonth; d++) {
            const cell = createDayCell(d, year, monthIndex, false);
            calendarGrid.appendChild(cell);
        }

        // Trailing days to complete 6 rows of 7 = 42 cells
        const currentCells = calendarGrid.children.length;
        const remaining = 42 - currentCells;
        for (let d = 1; d <= remaining; d++) {
            const cell = createDayCell(d, year, monthIndex + 1, true);
            calendarGrid.appendChild(cell);
        }
    }

    function createDayCell(day, year, monthIndex, isOutsideCurrentMonth) {
        const cell = document.createElement('button');
        cell.type = 'button';
        const date = new Date(year, monthIndex, day);
        const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());

        cell.textContent = String(day);
        cell.className = [
            'grid','place-items-center','text-sm','md:text-base','rounded-full','py-2','aspect-square',
            'transition-colors','duration-150', 'w-[35px] md:h-[56px]', 'h-[35px] md:w-[56px]'
        ].join(' ');

        if (isOutsideCurrentMonth) {
            cell.classList.add('text-[#B1B1B1]');
            cell.disabled = true;
            cell.classList.add('cursor-default');
        } else if (isPast) {
            cell.classList.add('text-[#B1B1B1]','opacity-60','cursor-not-allowed');
            cell.disabled = true;
        } else {
            cell.classList.add('text-black','hover:bg-[#FCF4E9]');
            cell.addEventListener('click', () => {
                selectedDate = date;
                // Clear previous selection styles
                [...calendarGrid.querySelectorAll('button')].forEach(b => b.classList.remove('bg-[#FCF4E9]','ring','ring-[#EDA133]'));
                cell.classList.add('bg-[#FCF4E9]','ring','ring-[#EDA133]');
                maybeEnableNext();
            });
        }

        // Keep selection visible when re-rendering
        if (selectedDate && isSameDate(date, selectedDate)) {
            cell.classList.add('bg-[#FCF4E9]','ring','ring-[#EDA133]');
        }

        return cell;
    }

    function maybeEnableNext() {
        if (selectedDate && selectedTimeSlot) {
            nextActionBtn.disabled = false;
            nextActionBtn.classList.remove('opacity-50','cursor-not-allowed');
        } else {
            nextActionBtn.disabled = true;
            nextActionBtn.classList.add('opacity-50','cursor-not-allowed');
        }
    }

    prevBtn.addEventListener('click', () => {
        if (viewMonth === 0) {
            viewMonth = 11;
            viewYear -= 1;
        } else {
            viewMonth -= 1;
        }
        renderCalendar(viewYear, viewMonth);
    });

    nextBtn.addEventListener('click', () => {
        if (viewMonth === 11) {
            viewMonth = 0;
            viewYear += 1;
        } else {
            viewMonth += 1;
        }
        renderCalendar(viewYear, viewMonth);
    });

    // Optional: read selection on Next
    nextActionBtn.addEventListener('click', () => {
        if (nextActionBtn.disabled) return;
        // Expose selection for later steps (customize as needed)
        const selectionEvent = new CustomEvent('consultationSelection', {
            detail: {
                dateISO: selectedDate ? selectedDate.toISOString() : null,
                timeSlot: selectedTimeSlot
            }
        });
        document.dispatchEvent(selectionEvent);
    });

    // Initial render
    renderTimeSlots();
    renderCalendar(viewYear, viewMonth);
    maybeEnableNext();
})

document.addEventListener('DOMContentLoaded', function () {

    // FAQ functionality
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const header = item.querySelector('.faq-header');
        const content = item.querySelector('.faq-content');
        const plusIcon = item.querySelector('.plus-icon');

        header.addEventListener('click', function () {
            const isExpanded = content.classList.contains('expanded');

            faqItems.forEach(otherItem => {
                const otherContent = otherItem.querySelector('.faq-content');
                const otherIcon = otherItem.querySelector('.plus-icon');

                if (otherItem !== item) {
                    otherContent.classList.remove('expanded');
                    resetToPlusIcon(otherIcon);
                }
            });

            if (isExpanded) {
                content.classList.remove('expanded');
                resetToPlusIcon(plusIcon);
            } else {
                content.classList.add('expanded');
                changeToXIcon(plusIcon);
            }
        });
    });

    // icon to X
    function changeToXIcon(iconElement) {
        iconElement.innerHTML = `
            <rect x="0.5" width="32" height="32" rx="6.4" fill="#F0AC49"/>
            <rect x="10.1367" y="11.0503" width="2" height="16" rx="1" transform="rotate(-45 10.1367 11.0503)" fill="white"/>
            <rect x="21.4492" y="9.63623" width="2" height="16" rx="1" transform="rotate(45 21.4492 9.63623)" fill="white"/>
        `;
    }

    // icon to plus
    function resetToPlusIcon(iconElement) {
        iconElement.innerHTML = `
            <rect x="0.5" width="32" height="32" rx="6.4" fill="#F0AC49"/>
            <rect x="8.5" y="17" width="2" height="16" rx="1" transform="rotate(-90 8.5 17)" fill="white"/>
            <rect x="24.5" y="15" width="2" height="16" rx="1" transform="rotate(90 24.5 15)" fill="white"/>
        `;
    }

        // Sidebar
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.getElementById('sidebar');
        const closeSidebar = document.getElementById('close-sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        if (menuToggle && sidebar && closeSidebar && overlay) {
            function openSidebar() {
                sidebar.classList.remove('translate-x-full');
                sidebar.classList.add('translate-x-0');
                overlay.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            }

            function closeSidebarFunc() {
                sidebar.classList.add('translate-x-full');
                sidebar.classList.remove('translate-x-0');
                overlay.classList.add('hidden');
                document.body.style.overflow = '';
            }

            menuToggle.addEventListener('click', openSidebar);
            closeSidebar.addEventListener('click', closeSidebarFunc);
            overlay.addEventListener('click', closeSidebarFunc);

            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') {
                    closeSidebarFunc();
                }
            });
        }

    })

document.addEventListener('DOMContentLoaded', function () {

    // const clientImages = document.querySelectorAll('.client-img');
    // clientImages.forEach((img, index) => {
    //     img.addEventListener('click', function () {
            // Get the slide index from data-slide attribute, fallback to index
    //         const slideIndex = img.getAttribute('data-slide') ? parseInt(img.getAttribute('data-slide')) : index;
    //         swiper2.slideTo(slideIndex);
    //     });
    // });

    const clientImages = document.querySelectorAll('.client-img');
    clientImages.forEach((img, index) => {
    img.addEventListener('click', function () {
        // Get the slide index from data-slide attribute, fallback to index
        const slideIndex = img.getAttribute('data-slide')
        ? parseInt(img.getAttribute('data-slide'))
        : index;

        // ✅ Use slideToLoop instead of slideTo
        swiper2.slideToLoop(slideIndex, 400); // 400ms animation
        swiperClient.slideToLoop(slideIndex, 400); // keep both in sync
    });
    });

})

document.addEventListener('DOMContentLoaded', function () {

    // Map Interactive Functionality
    const branchData = {
        'riyadh-1': {
            title: 'فرع الرياض',
            address: '7 ش حسين , الرياض , السعودية',
            phone: '(309) 8855-314',
            email: 'info@domainname.com',
            lat: 24.7136,
            lng: 46.6753
        },
        'jeddah-1': {
            title: 'فرع جدة',
            address: 'شارع التحلية، حي الشاطئ، جدة، السعودية',
            phone: '+966 12 345 6789',
            email: 'jeddah@domainname.com',
            lat: 21.4858,
            lng: 39.1925
        },
        'dammam-1': {
            title: 'فرع الدمام',
            address: 'شارع الملك خالد، حي الشاطئ، الدمام، السعودية',
            phone: '+966 13 234 5678',
            email: 'dammam@domainname.com',
            lat: 26.4207,
            lng: 50.0888
        },
        'makkah-1': {
            title: 'فرع مكة',
            address: 'شارع العزيزية، حي العزيزية، مكة المكرمة، السعودية',
            phone: '+966 12 123 4567',
            email: 'makkah@domainname.com',
            lat: 21.4225,
            lng: 39.8262
        }
    };

    // https://developers.google.com/maps/documentation/javascript/advanced-markers/html-markers#maps_advanced_markers_html-javascript

    const mapContainer = document.getElementById('saudi-map');
    const floatingCard = document.getElementById('floating-branch-card');
    const branchTitle = document.getElementById('branch-title');
    const branchContent = document.getElementById('branch-content');
    const closeButton = document.getElementById('close-branch-card');
    const mapLoading = document.getElementById('map-loading');

    let map;
    let markers = [];
    let activeInfoWindow = null;
    let activeMarker = null;

    // Initialize Google Maps
    async function initMap() {
        // Request needed libraries
        const { Map } = await google.maps.importLibrary("maps");
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

        // Center of Saudi Arabia
        const center = { lat: 24.7136, lng: 46.6753 };

        // Create map
        map = new Map(mapContainer, {
            zoom: 6,
            center: center,
            mapId: "4504f8b37365c3d0",
            styles: [
                {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{ visibility: 'off' }]
                }
            ]
        });

        // Build content for each branch marker (for when clicked)
        function buildBranchContent(branch) {
            const content = document.createElement("div");
            content.classList.add("branch-marker");
            content.innerHTML = `
                <div class="branch-card z-50" >
                    <div class="branch-details">
                        <h4 class="branch-title">${branch.title}</h4>
                        <div class="branch-info">
                            <div class="info-item">
                                <img src="assets/images/location-icon-svg.svg" alt="location" class="info-icon">
                                <span class="info-text">${branch.address}</span>
                            </div>
                            <div class="info-item">
                                <img src="assets/images/call-icon-svg.svg" alt="phone" class="info-icon">
                                <span class="info-text">${branch.phone}</span>
                            </div>
                            <div class="info-item">
                                <img src="assets/images/email-icon-svg.svg" alt="email" class="info-icon">
                                <span class="info-text">${branch.email}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            return content;
        }

        // Add markers for each branch
        Object.keys(branchData).forEach(branchId => {
            const branch = branchData[branchId];

            // Create marker with custom icon
            const marker = new AdvancedMarkerElement({
                position: { lat: branch.lat, lng: branch.lng },
                map: map,
                content: createMarkerIcon(),
                title: branch.title,
            });

            // Add click event to marker
            marker.addListener('click', function () {
                toggleHighlight(marker, branch);
            });
        });

        // Function to create marker icon element
        function createMarkerIcon() {
            const iconElement = document.createElement('div');
            iconElement.innerHTML = `
                <svg class="relative z-10" width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_3191_16566)">
                        <path d="M18 36C27.9411 36 36 27.9411 36 18C36 8.05887 27.9411 0 18 0C8.05887 0 0 8.05887 0 18C0 27.9411 8.05887 36 18 36Z" fill="#EDA133"/>
                        <path d="M18.0331 7.74414C14.5488 7.74928 11.6045 10.9057 11.6045 14.6381C11.6045 16.982 12.8105 19.1561 14.1438 20.8533C12.1471 21.1683 9.00098 21.9551 9.00098 23.7834C8.99969 25.8946 13.5254 26.9977 17.9984 26.9977C22.4714 26.9977 26.9984 25.8933 26.9984 23.7834C26.9984 21.9564 23.8523 21.1709 21.8633 20.8559C23.221 19.0816 24.4617 16.7583 24.4617 14.156C24.4617 12.4113 23.806 10.7939 22.6141 9.60328C21.4133 8.40371 19.7907 7.74414 18.0434 7.74414H18.0331ZM18.0331 9.03243H18.0434C19.4461 9.03243 20.7473 9.55957 21.7051 10.5149C22.654 11.4624 23.176 12.7546 23.176 14.156C23.176 18.3526 19.2841 21.9449 18.0331 22.9889C16.7783 21.9551 12.8903 18.44 12.8903 14.6407C12.8903 11.6051 15.2444 9.03628 18.0331 9.03243ZM17.9277 11.5987C17.2468 11.6271 16.6049 11.9243 16.1427 12.4251C15.6805 12.9259 15.4356 13.5894 15.4617 14.2704C15.4904 14.9517 15.7881 15.5938 16.2893 16.056C16.7906 16.5182 17.4546 16.7629 18.136 16.7364C18.817 16.7083 19.4591 16.4113 19.9214 15.9104C20.3837 15.4096 20.6284 14.7458 20.602 14.0647C20.5712 13.3842 20.273 12.7433 19.7722 12.2815C19.2714 11.8197 18.6085 11.5743 17.9277 11.5987ZM17.9804 12.8819H18.0331C18.3741 12.875 18.7038 13.004 18.9498 13.2402C19.1957 13.4765 19.3377 13.8009 19.3445 14.1419C19.3514 14.4828 19.2225 14.8126 18.9862 15.0585C18.7499 15.3045 18.4255 15.4465 18.0845 15.4533C17.4211 15.4816 16.7757 14.9287 16.7474 14.2203C16.7342 13.8794 16.8567 13.5472 17.0881 13.2965C17.3195 13.0458 17.6408 12.8972 17.9817 12.8831L17.9804 12.8819ZM15.1351 22.0233C15.9071 22.8615 16.7488 23.6327 17.6513 24.3286L18.0331 24.614L18.4188 24.3286C18.523 24.2501 19.6454 23.4029 20.8938 22.0259C24.2418 22.4193 25.7153 23.3681 25.7153 23.786C25.7153 24.4661 22.7864 25.7146 18.001 25.7146C13.2155 25.7146 10.2867 24.4661 10.2867 23.786C10.2854 23.3669 11.7653 22.4154 15.1351 22.0233Z" fill="white"/>
                    </g>
                    <defs>
                        <clipPath id="clip0_3191_16566">
                            <rect width="36" height="36" fill="white"/>
                        </clipPath>
                    </defs>
                </svg>
            `;
            return iconElement;
        }

        // Function to toggle highlight and show card
        function toggleHighlight(markerView, branch) {
            // If there's an active marker, reset it first
            if (activeMarker && activeMarker !== markerView) {
                activeMarker.content.classList.remove("highlight");
                activeMarker.zIndex = null;
                activeMarker.content.innerHTML = createMarkerIcon().innerHTML;
            }

            if (markerView.content.classList.contains("highlight")) {
                // Remove highlight and show default icon
                markerView.content.classList.remove("highlight");
                markerView.zIndex = 100;
                markerView.content.innerHTML = createMarkerIcon().innerHTML;
                activeMarker = null;

                // Hide floating card
                floatingCard.style.opacity = '0';
                floatingCard.style.pointerEvents = 'none';
                floatingCard.style.transform = 'translateY(2px)';
            } else {
                // Add highlight and show card content
                markerView.content.classList.add("highlight");
                markerView.zIndex = 1000;
                markerView.content.innerHTML = buildBranchContent(branch).innerHTML;
                activeMarker = markerView;

                // Show floating card
                // branchTitle.textContent = branch.title;
                // branchContent.innerHTML = `
                //     <div class="flex items-center gap-3">
                //         <img src="assets/images/location-icon-svg.svg" alt="location icon" class="w-5 h-5">
                //         <span class="font-medium text-sm text-[#232323] leading-tight">${branch.address}</span>
                //     </div>

                //     <div class="flex items-center gap-3">
                //         <img src="assets/images/call-icon-svg.svg" alt="call icon" class="w-5 h-5">
                //         <span class="font-medium text-sm text-[#232323]">${branch.phone}</span>
                //     </div>

                //     <div class="flex items-center gap-3">
                //         <img src="assets/images/email-icon-svg.svg" alt="email icon" class="w-5 h-5">
                //         <span class="font-medium text-sm text-[#232323]">${branch.email}</span>
                //     </div>
                // `;

                // Show the card with animation
                floatingCard.style.opacity = '1';
                floatingCard.style.pointerEvents = 'auto';
                floatingCard.style.transform = 'translateY(0)';
            }
        }

        // Hide loading overlay when map is ready
        map.addListener('tilesloaded', function () {
            if (mapLoading) {
                mapLoading.style.opacity = '0';
                setTimeout(() => {
                    mapLoading.style.display = 'none';
                }, 500);
            }
        });
    }

    // Close branch card
    closeButton.addEventListener('click', function () {
        floatingCard.style.opacity = '0';
        floatingCard.style.pointerEvents = 'none';
        floatingCard.style.transform = 'translateY(2px)';

        // Reset active marker
        if (activeMarker) {
            activeMarker.content.classList.remove("highlight");
            activeMarker.zIndex = 100;
            activeMarker.content.innerHTML = createMarkerIcon().innerHTML;
            activeMarker = null;
        }

        // Close any open info window
        if (activeInfoWindow) {
            activeInfoWindow.close();
            activeInfoWindow = null;
        }
    });

    // Close card when clicking outside
    document.addEventListener('click', function (event) {
        if (!floatingCard.contains(event.target) && !event.target.closest('.gm-style')) {
            floatingCard.style.opacity = '0';
            floatingCard.style.pointerEvents = 'none';
            floatingCard.style.transform = 'translateY(2px)';

            // Reset active marker
            if (activeMarker) {
                activeMarker.content.classList.remove("highlight");
                activeMarker.zIndex = 100;
                activeMarker.content.innerHTML = createMarkerIcon().innerHTML;
                activeMarker = null;
            }

            // Close any open info window
            if (activeInfoWindow) {
                activeInfoWindow.close();
                activeInfoWindow = null;
            }
        }
    });

    // Add keyboard support
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            floatingCard.style.opacity = '0';
            floatingCard.style.pointerEvents = 'none';
            floatingCard.style.transform = 'translateY(2px)';

            // Reset active marker
            if (activeMarker) {
                activeMarker.content.classList.remove("highlight");
                activeMarker.zIndex = 100;
                activeMarker.content.innerHTML = createMarkerIcon().innerHTML;
                activeMarker = null;
            }

            // Close any open info window
            if (activeInfoWindow) {
                activeInfoWindow.close();
                activeInfoWindow = null;
            }
        }
    });

    if (typeof google !== 'undefined' && google.maps) {
        initMap();
    } else {
        window.addEventListener('load', function () {
            if (typeof google !== 'undefined' && google.maps) {
                initMap();
            }
        });
    }

});

const slidesCountSwiper2 = document.querySelectorAll('.swiper-2 .swiper-slide').length;
const middleIndexSwiper2 = Math.floor(slidesCountSwiper2 / 2);

// Client Images 
const clientImages = document.querySelectorAll('.client-img');

// function updateClientImages(activeIndex) {
//     let slidesPerView = 5;
//     if (window.innerWidth < 768) {
//         slidesPerView = 3;
//     }

//     clientImages.forEach((img, index) => {
//         img.classList.remove('w-[80px]', 'md:w-[120px]', 'h-[80px]', 'md:h-[120px]', 'border-4', 'border-[#EDA133]');
//         img.classList.remove('w-[100px]', 'h-[100px]');
//         img.classList.remove('border-1', 'border-gray-200');

//         const slideContainer = img.closest('.swiper-slide');
//         if (slideContainer) {
//             slideContainer.classList.remove('translate-y-[-80px]', 'translate-y-[-40px]', 'translate-y-[-20px]');

//             const positionInCurrentView = index % slidesPerView;
//             // const activeSlide = document.querySelector('.swiper-slide-active');
//             const prevSlide = document.querySelector('.clientSwiper .swiper-slide-prev');
//             const nextSlide = document.querySelector('.clientSwiper .swiper-slide-next');
//             // const prevSlide = activeSlide.previousElementSibling;
//             // const nextSlide = activeSlide.nextElementSibling;
//             console.log(prevSlide);
            

//             if (slidesPerView === 5) {
//                 prevSlide.classList.add('translate-y-[-20px]'); // Center
//                 nextSlide.classList.add('translate-y-[-20px]'); // Center
                
//                 // if (positionInCurrentView === 0 || positionInCurrentView === 4) {
//                 //     slideContainer.classList.add('translate-y-[-80px]'); // Corners
//                 // } else if (positionInCurrentView === 1 || positionInCurrentView === 3) {
//                 //     slideContainer.classList.add('translate-y-[-40px]'); // Second positions
//                 // } else if (positionInCurrentView === 2) {
//                 //     slideContainer.classList.add('translate-y-[-20px]'); // Center
//                 // }
//             } else if (slidesPerView === 3) {
//                 if (positionInCurrentView === 0 || positionInCurrentView === 2) {
//                     slideContainer.classList.add('translate-y-[-80px]'); // Corners
//                 } else if (positionInCurrentView === 1) {
//                     slideContainer.classList.add('translate-y-[-40px]'); // Center
//                 }
//             }
//         }

//         img.style.transform = 'scale(1.0)';

//         const slideIndex = img.getAttribute('data-slide') ? parseInt(img.getAttribute('data-slide')) : index;

//         if (slideIndex === activeIndex) {
//             img.classList.add('w-[80px]', 'md:w-[120px]', 'h-[80px]', 'md:h-[120px]', 'border-4', 'border-[#EDA133]');
//             img.style.transform = 'scale(1.1)';
//         } else {
//             img.classList.add('w-[80px]', 'md:w-[120px]', 'h-[80px]', 'md:h-[120px]', 'border-1', 'border-gray-200');
//         }
//     });
// }

const swiper2 = new Swiper('.swiper-2', {
    direction: 'horizontal',
    slidesPerView: 1,
    spaceBetween: 48,
    initialSlide: middleIndexSwiper2,
    centeredSlides: true,
    loop: true,
    // speed: 1000, 
    allowTouchMove: false, 

    // autoplay: {
    //     delay: 5000,
    //     disableOnInteraction: true,
    // },

    navigation: {
        nextEl: '.swiper-2-button-next-1',
        prevEl: '.swiper-2-button-prev-1',
    },

    // on: {
        // slideChange: function () {
        //     updateClientImages(this.realIndex);
        // },
        // init: function () {
        //     updateClientImages(this.realIndex);
        // },
        // resize: function () {
        //     updateClientImages(this.realIndex);
        // }
    // },

    // Responsive breakpoints
    breakpoints: {
        320: {
            spaceBetween: 10,
            slidesPerView: 1.2,
        },
        768: {
            spaceBetween: 40
        },
        1024: {
            spaceBetween: 48,
            slidesPerView: 1.64
        }
    }
});


const swiper3 = new Swiper('.swiper-3', {
    direction: 'horizontal',
    slidesPerView: 1,
    spaceBetween: 48,
    loop: true,
    centeredSlides: true,

    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },

    // lazy: {
    //     loadPrevNext: true,
    //     loadPrevNextAmount: 2,
    //   },
    //   preloadImages: false,
    //   watchSlidesProgress: true,
    //   watchSlidesVisibility: true,

    navigation: {
        nextEl: '.swiper-3-button-next-1',
        prevEl: '.swiper-3-button-prev-1',
    },

    // Responsive breakpoints
    breakpoints: {
        320: {
            spaceBetween: 16,
            slidesPerView: 1.2,
        },
        768: {
            spaceBetween: 40,
            slidesPerView: 1.2,
        },
        1024: {
            spaceBetween: 20,
            slidesPerView: 1.15,
        },
        1280: {
            spaceBetween: 20,
            slidesPerView: 1.07,
        },
        1440: {
            spaceBetween: 20,
            slidesPerView: 1.2,
        },
        1536: {
            spaceBetween: 48,
            slidesPerView: 1.53,
        }
    }
});

const swiper4 = new Swiper('.branches', {
    direction: 'horizontal',
    slidesPerView: 1.25,
    spaceBetween: 25,
    // Responsive breakpoints
    breakpoints: {
        320: {
            slidesPerView: 1.35,
            spaceBetween: 25,
        },
        768: {
            spaceBetween: 40,
            slidesPerView: 2
        },
        1024: {
            spaceBetween: 48,
            slidesPerView: 4
        },
        1279: {
            spaceBetween: 160,
            slidesPerView: 4
        }
    },

    // pagination: {
    // el: '.swiper-pagination',
    // },
});

const swiper5 = new Swiper('.articles', {
    direction: 'horizontal',
    slidesPerView: 3,
    spaceBetween: 25,
    // Responsive breakpoints
    breakpoints: {
        320: {
            slidesPerView: 1.1,
            spaceBetween: 25,
        },
        768: {
            spaceBetween: 40,
            slidesPerView: 2
        },
        1024: {
            spaceBetween: 48,
            slidesPerView: 3
        },
        1279: {
            spaceBetween: 48,
            slidesPerView: 3
        }
    }
});

const swiperClient = new Swiper('.clientSwiper', {
    slidesPerView: 5,
    spaceBetween: 50,
    centeredSlides: true,
    loop: true,
    navigation: {
      nextEl: '.swiper-2-button-next-1',
      prevEl: '.swiper-2-button-prev-1',
    },
    // slidesPerGroup: 1, // 👈 ensures only 1 slide moves per swipe
    // freeMode: {
    //     enabled: false,
    //     sticky: false,
    //   },  // 👈 prevents "free scrolling"
    // speed: 400,

    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },
    allowTouchMove: false, 
    breakpoints: {
      320: { slidesPerView: 3, spaceBetween: 40 },
      768: { slidesPerView: 5, spaceBetween: 30 },
      1024: { slidesPerView: 5, spaceBetween: 40 },
      1280: { slidesPerView: 5, spaceBetween: 10 },
    },
    on: {
      init: function () {
        this.slides.forEach((slide) => {
          slide.classList.add(
            'transition-all',
            'duration-500',
            'ease-in-out'
          );
          const img = slide.querySelector('img');
          if (img) {
            img.classList.add(
              'transition-all',
              'duration-500',
              'ease-in-out'
            );
          }
        });
      },
      slideChange: function () {
        this.slides.forEach((slide) => {
          slide.classList.remove(
            'translate-y-[-80px]',
            'translate-y-[-20px]',
            'translate-y-[-40px]'
          );
  
          const img = slide.querySelector('img');
          if (img) {
            img.classList.remove(
              'w-[80px]',
              'md:w-[100px]',
              'h-[80px]',
              'md:h-[100px]',
              'border-4',
              'border-[#EDA133]',
              'border-1',
              'border-gray-200'
            );
            img.style.transform = 'scale(1.0)';
  
            img.classList.add(
              'w-[80px]',
              'md:w-[100px]',
              'h-[80px]',
              'md:h-[100px]',
              'border-1',
              'border-gray-200'
            );
          }
        });
  
        // Active slide
        const active = this.slides[this.activeIndex];
        if (active) {
          const img = active.querySelector('img');
          if (img) {
            img.classList.remove('border-1', 'border-gray-200');
            img.classList.add(
              'w-[80px]',
              'md:w-[100px]',
              'h-[80px]',
              'md:h-[100px]',
              'border-4',
              'border-[#EDA133]'
            );
            img.style.transform = 'scale(1.1)';
          }
        }
  
        const prev = active?.previousElementSibling;
        const next = active?.nextElementSibling;
  
        if (prev) {
          prev.classList.add('translate-y-[-20px]');
          if (prev.previousElementSibling) {
            prev.previousElementSibling.classList.add('translate-y-[-80px]');
        } 
        
        if (prev.previousElementSibling.previousElementSibling) {
              prev.previousElementSibling.previousElementSibling.classList.add('translate-y-[-80px]');
          }
        }
  
        if (next) {
          next.classList.add('translate-y-[-20px]');
          if (next.nextElementSibling) {
            next.nextElementSibling.classList.add('translate-y-[-80px]');
        } 
        
        if (next.nextElementSibling.nextElementSibling) {
              next.nextElementSibling.nextElementSibling.classList.add('translate-y-[-80px]');
          }
        }
      },
    },
  });

swiperClient.controller.control = swiper2;
// swiper2.controller.control = swiperClient;

// swiperClient.on('slideChange', function () {
//   swiper2.slideToLoop(swiperClient.realIndex, 600);
// });

// f
// swiper2.on('slideChange', function () {
//   swiperClient.slideToLoop(swiper2.realIndex, 600);
// });

// let syncing = false;

// swiperClient.on('slideChange', function () {
//   if (!syncing) {
//     syncing = true;
//     swiper2.slideToLoop(swiperClient.realIndex, 600); // 600ms animation
//     syncing = false;
//   }
// });

// swiper2.on('slideChange', function () {
//   if (!syncing) {
//     syncing = true;
//     swiperClient.slideToLoop(swiper2.realIndex, 600);
//     syncing = false;
//   }
// });

const projectIcons = new Swiper('.projects-logos', {
    direction: 'horizontal',
    slidesPerView: 8,
    spaceBetween: 78,
    loop: true,
    autoplay: {
        delay: 2000,
        disableOnInteraction: false,
    },

    breakpoints: {
        320: {
            spaceBetween: 50,
            slidesPerView: 3
        },

        768: {
            spaceBetween: 78,
            slidesPerView: 4
        },
        1024: {
            spaceBetween: 78,
            slidesPerView: 5
        },
        1279: {
            spaceBetween: 78,
            slidesPerView: 8
        }

    },
});

const serviceMarquee1 = new Swiper('.swiper-6', {
    direction: 'horizontal',
    slidesPerView: 8,
    spaceBetween: 78,
    loop: true,
    autoplay: {
        delay: 2000,
        disableOnInteraction: false,
    },

    breakpoints: {
        320: {
            spaceBetween: 20,
            slidesPerView: 5
        },

        768: {
            spaceBetween: 78,
            slidesPerView: 7
        },
        1024: {
            spaceBetween: 78,
            slidesPerView: 7
        },
        1279: {
            spaceBetween: 10,
            slidesPerView: 13
        }

    },
});

const serviceMarquee2 = new Swiper('.swiper-7', {
    direction: 'horizontal',
    slidesPerView: 8,
    spaceBetween: 78,
    loop: true,
    autoplay: {
        delay: 2000,
        disableOnInteraction: false,
        reverseDirection: true,
    },

    breakpoints: {
        320: {
            spaceBetween: 5,
            slidesPerView: 5
        },

        768: {
            spaceBetween: 78,
            slidesPerView: 7
        },
        1024: {
            spaceBetween: 78,
            slidesPerView: 7
        },
        1279: {
            spaceBetween: 10,
            slidesPerView: 13
        }

    },
});

const otherPreviousProjects = new Swiper('.previousProjects', {
    direction: 'horizontal',
    slidesPerView: 2,
    spaceBetween: 32,
    loop: true,
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },

    breakpoints: {
        320: {
            spaceBetween: 50,
            slidesPerView: 1
        },

        768: {
            spaceBetween: 32,
            slidesPerView: 1
        },
        1024: {
            spaceBetween: 32,
            slidesPerView: 2
        },
        1279: {
            spaceBetween: 32,
            slidesPerView: 2
        }
    },

    navigation: {
        nextEl: '.previous-Projects-button-next-1',
        prevEl: '.previous-Projects-button-prev-1',
    },
});


const blogsCategoryIcons = new Swiper('.blogs-category-icons', {
    direction: 'horizontal',
    slidesPerView: 5,
    spaceBetween: 32,

    breakpoints: {
        320: {
            spaceBetween: 27,
            slidesPerView: 5
        },

        768: {
            spaceBetween: 32,
            slidesPerView: 1
        },
        1024: {
            spaceBetween: 32,
            slidesPerView: 2
        },
        1279: {
            spaceBetween: 32,
            slidesPerView: 2
        }
    },
});

const otherBlogs = new Swiper('.otherBlogs', {
    direction: 'horizontal',
    slidesPerView: 3,
    spaceBetween: 32,
    loop: true,
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },

    breakpoints: {
        320: {
            spaceBetween: 50,
            slidesPerView: 1
        },

        768: {
            spaceBetween: 32,
            slidesPerView: 2
        },
        1024: {
            spaceBetween: 32,
            slidesPerView: 2
        },
        1279: {
            spaceBetween: 32,
            slidesPerView: 3
        }
    },

    navigation: {
        nextEl: '.other-blogs-button-next-1',
        prevEl: '.other-blogs-button-prev-1',
    },
});

const culturesValues = new Swiper('.culturesValue', {
    direction: 'horizontal',
    slidesPerView: 3,
    spaceBetween: 32,
    loop: true,
    // autoplay: {
    //     delay: 5000,
    //     disableOnInteraction: false,
    // },

    breakpoints: {
        320: {
            spaceBetween: 24,
            slidesPerView: 1.25
        },

        768: {
            spaceBetween: 32,
            slidesPerView: 2
        },
        1024: {
            spaceBetween: 32,
            slidesPerView: 2
        },
        1279: {
            spaceBetween: 32,
            slidesPerView: 3
        }
    },

    navigation: {
        nextEl: '.other-culturesValue-button-next-1',
        prevEl: '.other-culturesValue-button-prev-1',
    },
});

const benefits = new Swiper('.benefits', {
    direction: 'horizontal',
    slidesPerView: 3,
    spaceBetween: 32,
    loop: true,
    // autoplay: {
    //     delay: 5000,
    //     disableOnInteraction: false,
    // },

    breakpoints: {
        320: {
            spaceBetween: 24,
            slidesPerView: 1.25
        },

        768: {
            spaceBetween: 32,
            slidesPerView: 2
        },
        1024: {
            spaceBetween: 25,
            slidesPerView: 3
        },
        1279: {
            spaceBetween: 32,
            slidesPerView: 3
        }
    },

    navigation: {
        nextEl: '.benefits-button-next-1',
        prevEl: '.benefits-button-prev-1',
    },
});


const slidesCountEmailBranches = document.querySelectorAll('.emailBranches .swiper-slide').length;
const middleIndexEmailBranches = Math.floor(slidesCountEmailBranches / 2);


const emailBranches = new Swiper('.emailBranches', {
    direction: 'horizontal',
    initialSlide: middleIndexEmailBranches,
    slidesPerView: 1,
    spaceBetween: 20,
    // loop: true,
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },
    centeredSlides: true,



    // Responsive breakpoints
    breakpoints: {
        320: {
            slidesPerView: 1.2,
            spaceBetween: 15,
        },
        480: {
            slidesPerView: 1.5,
            spaceBetween: 20,
        },
        768: {
            slidesPerView: 2,
            spaceBetween: 25,
        },
        1024: {
            slidesPerView: 2,
            spaceBetween: 30,
        }
    },
});

// start your projects
const buttons = document.querySelectorAll(".role-btn");
const otherButton = document.getElementById("other-button");
const otherField = document.getElementById("other-button-field");

buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("active-btn"));

        btn.classList.add("active-btn");

        if (btn === otherButton) {
            otherField.classList.remove("hidden");
        } else {
            otherField.classList.add("hidden");
        }
    });
});

// start your projects file input section
const fileInputSettings = document.querySelectorAll(".file-input-settings");
const uploadFileButton = document.getElementById("upload-files")
const fileInputSection = document.getElementById("file-input-settings-section");

fileInputSettings.forEach((btn) => {
    btn.addEventListener("click", () => {
        fileInputSettings.forEach((b) => b.classList.remove("active-btn"));

        btn.classList.add("active-btn");

        if (btn === uploadFileButton) {
            fileInputSection.classList.remove("hidden");
        } else {
            fileInputSection.classList.add("hidden");
        }
    });
});



// phone input with country code
const dropdownBtn = document.getElementById("countryDropdownBtn");
const dropdown = document.getElementById("countryDropdown");
const selectedCode = document.getElementById("selectedCode");

dropdownBtn.addEventListener("click", () => {
    dropdown.classList.toggle("hidden");
});

dropdown.querySelectorAll("div").forEach((item) => {
    item.addEventListener("click", () => {
        const code = item.getAttribute("data-code");
        const flag = item.getAttribute("data-flag");

        selectedCode.textContent = code;
        dropdownBtn.querySelector("span.text-xs").textContent = flag;

        dropdown.classList.add("hidden");
    });
});

document.addEventListener("click", (e) => {
    if (!dropdownBtn.contains(e.target)) {
        dropdown.classList.add("hidden");
    }
});


document.addEventListener("DOMContentLoaded", () => {
    const uploadArea = document.getElementById("upload-area");
    const fileInput = document.getElementById("file-input");
    const fileList = document.getElementById("file-list");

    uploadArea.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", (e) => {
        handleFiles(e.target.files);
    });

    uploadArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        uploadArea.classList.add("bg-orange-100");
    });

    uploadArea.addEventListener("dragleave", () => {
        uploadArea.classList.remove("bg-orange-100");
    });

    uploadArea.addEventListener("drop", (e) => {
        e.preventDefault();
        uploadArea.classList.remove("bg-orange-100");
        handleFiles(e.dataTransfer.files);
    });

    function handleFiles(files) {
        [...files].forEach((file) => {
            const fileItem = document.createElement("section");
            fileItem.className =
                "bg-[#F5F5F5] border border-[#DADADA] rounded-xl p-4";

            fileItem.innerHTML = `
            <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                <img src="assets/images/pdf-doc.svg" alt="file icon" />
                <div>
                        <p class="text-sm font-bold text-black">${file.name}</p>
                        <p class="text-xs text-[#4A4A4A]">${(file.size / 1024).toFixed(
                        1
                    )} KB</p>
                </div>
            </div>
                <button class="delete-btn bg-white rounded cursor-pointer">
                    <img src="assets/images/delete-icon.svg" alt="delete icon">
                </button>
            </div>
            <div class="w-full h-2 bg-[#FCF4E9] rounded-full overflow-hidden mt-[12px]">
                <div class="progress-bar h-full bg-[#EDA133] rounded-full" style="width:0%"></div>
            </div>
        `;

            fileList.appendChild(fileItem);

            // progress bar animation
            const progressBar = fileItem.querySelector(".progress-bar");
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                progressBar.style.width = progress + "%";
                if (progress >= 100) clearInterval(interval);
            }, 200);


            fileItem
                .querySelector(".delete-btn")
                .addEventListener("click", () => fileItem.remove());
        });
    }
});

