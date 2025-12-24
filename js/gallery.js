/**
 * Image Gallery Manager
 * Handles dynamic loading and display of images from notes
 */

(function() {
    'use strict';

    // Get folder from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const folderParam = urlParams.get('folder');

    // Gallery state
    let allImages = [];
    let currentImageIndex = 0;
    let filteredImages = [];

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        loadImages();
        setupKeyboardNavigation();
    }

    // Load images from notes-list.json
    async function loadImages() {
        try {
            const response = await fetch('../notes-list.json');
            const data = await response.json();
            
            if (folderParam === 'all') {
                // Load all images from all folders
                document.querySelector('.gallery-header h1').textContent = '🖼️ All Images';
                data.notes.forEach(note => {
                    if (note.hasImages && note.images) {
                        note.images.forEach(img => {
                            allImages.push({
                                name: img.name,
                                file: `${note.folder}/${img.file}`,
                                folder: note.title
                            });
                        });
                    }
                });
            } else {
                // Load images from specific folder
                const note = data.notes.find(n => n.folder === folderParam);
                if (note && note.hasImages && note.images) {
                    document.querySelector('.gallery-header h1').textContent = `🖼️ Images - ${note.title}`;
                    allImages = note.images.map(img => ({
                        name: img.name,
                        file: `${note.folder}/${img.file}`,
                        folder: note.title
                    }));
                }
            }
            
            filteredImages = [...allImages];
            loadGallery();
        } catch (error) {
            console.error('Error loading images:', error);
            document.getElementById('gallery').innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                    <p>Error loading images. Please ensure notes-list.json exists.</p>
                </div>
            `;
        }
    }

    // Render gallery
    function loadGallery() {
        const gallery = document.getElementById('gallery');
        const imageCount = document.getElementById('imageCount');
        
        if (filteredImages.length === 0) {
            gallery.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                    <p>No images found.</p>
                </div>
            `;
            imageCount.textContent = '0 images';
            return;
        }
        
        gallery.innerHTML = filteredImages.map((img, index) => `
            <div class="image-card" onclick="openLightbox(${index})">
                <div class="image-wrapper">
                    <img 
                        src="${img.file}" 
                        alt="${img.name}" 
                        loading="lazy"
                        onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'image-error\\'>📷<br>Image not found</div>';"
                    >
                </div>
                <div class="image-info">
                    <div class="image-name">${img.name}</div>
                    <div class="image-meta">📁 ${img.folder}</div>
                </div>
            </div>
        `).join('');

        imageCount.textContent = `${filteredImages.length} image${filteredImages.length !== 1 ? 's' : ''}`;
    }

    // Filter images by search term
    function filterImages() {
        const search = document.getElementById('searchBox').value.toLowerCase();
        filteredImages = allImages.filter(img => 
            img.name.toLowerCase().includes(search) || 
            img.folder.toLowerCase().includes(search)
        );
        loadGallery();
    }

    // Set view mode (grid or list)
    function setView(view, button) {
        const gallery = document.getElementById('gallery');
        const buttons = document.querySelectorAll('.view-btn');
        
        buttons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        if (view === 'list') {
            gallery.classList.add('list-view');
        } else {
            gallery.classList.remove('list-view');
        }
    }

    // Open lightbox
    function openLightbox(index) {
        currentImageIndex = index;
        const img = filteredImages[index];
        
        document.getElementById('lightboxImage').src = img.file;
        document.getElementById('lightboxName').textContent = img.name;
        document.getElementById('lightboxCounter').textContent = `Image ${index + 1} of ${filteredImages.length}`;
        document.getElementById('lightbox').classList.add('active');
    }

    // Close lightbox
    function closeLightbox(event) {
        if (!event || event.target.id === 'lightbox') {
            document.getElementById('lightbox').classList.remove('active');
        }
    }

    // Navigate between images
    function navigateImage(direction) {
        currentImageIndex += direction;
        
        if (currentImageIndex < 0) currentImageIndex = filteredImages.length - 1;
        if (currentImageIndex >= filteredImages.length) currentImageIndex = 0;
        
        const img = filteredImages[currentImageIndex];
        document.getElementById('lightboxImage').src = img.file;
        document.getElementById('lightboxName').textContent = img.name;
        document.getElementById('lightboxCounter').textContent = `Image ${currentImageIndex + 1} of ${filteredImages.length}`;
    }

    // Download current image
    function downloadImage() {
        const img = filteredImages[currentImageIndex];
        const link = document.createElement('a');
        link.href = img.file;
        link.download = img.file.split('/').pop();
        link.click();
    }

    // Setup keyboard navigation
    function setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            const lightbox = document.getElementById('lightbox');
            if (lightbox.classList.contains('active')) {
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowLeft') navigateImage(-1);
                if (e.key === 'ArrowRight') navigateImage(1);
            }
        });
    }

    // Expose functions to global scope for HTML event handlers
    window.filterImages = filterImages;
    window.setView = setView;
    window.openLightbox = openLightbox;
    window.closeLightbox = closeLightbox;
    window.navigateImage = navigateImage;
    window.downloadImage = downloadImage;
})();