/**
 * PDF Generator
 * Generates PDF from CV page using jsPDF and html2canvas
 * 
 * NOTE: This approach converts the entire CV to an image and then splits it across PDF pages.
 * While we add CSS hints (page-break-inside: avoid) and spacing to minimize awkward breaks,
 * html2canvas doesn't fully respect page-break CSS properties since it renders to a single image.
 * 
 * For better page break control, consider:
 * - pdfmake (generates PDF directly from content structure)
 * - puppeteer (server-side rendering with better CSS print support)
 * - Manual section-by-section rendering
 * 
 * Current optimizations:
 * - Added margins to PDF (10mm on each side)
 * - Increased spacing between sections to create natural break points
 * - Higher quality rendering (scale: 2)
 */

document.addEventListener('DOMContentLoaded', function() {
    const downloadBtn = document.getElementById('downloadPDF');
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', generatePDF);
    }
});

async function generatePDF() {
    const button = document.getElementById('downloadPDF');
    const originalText = button.innerHTML;
    
    // Show loading state
    button.disabled = true;
    button.innerHTML = `
        <svg class="inline w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Generating PDF...
    `;
    
    try {
        // Get the CV content
        const content = document.getElementById('cv-content');
        
        if (!content) {
            alert('CV content not found. Please ensure you are on the CV page.');
            return;
        }
        
        // Clone the content to avoid modifying the original
        const clone = content.cloneNode(true);
        
        // Add PDF mode class for compact layout
        clone.classList.add('pdf-mode');
        
        // Remove no-print elements from clone
        const noPrintElements = clone.querySelectorAll('.no-print');
        noPrintElements.forEach(el => el.remove());
        
        // Add PDF-specific styling to prevent breaks
        const itemsToProtect = clone.querySelectorAll('.work-experience-item, .education-item, .certification-item');
        itemsToProtect.forEach(item => {
            item.style.pageBreakInside = 'avoid';
            item.style.breakInside = 'avoid';
        });
        
        // Force ultra-compact spacing with inline styles (override Tailwind)
        // Target ALL sections and remove py-12 padding
        const allSections = clone.querySelectorAll('section');
        allSections.forEach(section => {
            section.style.paddingTop = '0.2rem';
            section.style.paddingBottom = '0.2rem';
            section.style.marginTop = '0';
            section.style.marginBottom = '0';
            section.style.paddingLeft = '1rem';
            section.style.paddingRight = '1rem';
        });
        
        // Reduce h2 spacing aggressively
        const allH2 = clone.querySelectorAll('h2');
        allH2.forEach(h2 => {
            h2.style.marginBottom = '0.2rem';
            h2.style.marginTop = '0.2rem';
        });
        
        // Ultra-compact About Me section
        const aboutSection = clone.querySelector('#about-section');
        if (aboutSection) {
            aboutSection.style.paddingTop = '0.15rem';
            aboutSection.style.paddingBottom = '0.1rem';
            aboutSection.style.marginBottom = '0';
            
            const aboutMb6 = aboutSection.querySelector('.mb-6');
            if (aboutMb6) {
                aboutMb6.style.marginBottom = '0.15rem';
                aboutMb6.style.paddingBottom = '0.1rem';
            }
            const aboutProse = aboutSection.querySelector('.prose');
            if (aboutProse) {
                aboutProse.style.marginBottom = '0.1rem';
            }
            
            // Reduce paragraph spacing in About Me
            const aboutParagraphs = aboutSection.querySelectorAll('p');
            aboutParagraphs.forEach(p => {
                p.style.marginTop = '0.15rem';
                p.style.marginBottom = '0.15rem';
            });
        }
        
        // Compact work experience items (the white boxes)
        const workExpItems = clone.querySelectorAll('.work-experience-item');
        workExpItems.forEach(item => {
            item.style.padding = '0.4rem';
            item.style.marginBottom = '0.25rem';
        });
        
        // Compact education items (the white boxes)
        const educationItems = clone.querySelectorAll('.education-item');
        educationItems.forEach(item => {
            item.style.padding = '0.4rem';
            item.style.marginBottom = '0.25rem';
        });
        
        // Compact work experience spacing container
        const spaceY8 = clone.querySelectorAll('.space-y-8');
        spaceY8.forEach(container => {
            container.style.gap = '0';
            container.style.marginTop = '0';
            const children = container.children;
            for (let child of children) {
                child.style.marginTop = '0';
                child.style.marginBottom = '0.2rem';
            }
        });
        
        // Compact education spacing container
        const spaceY6 = clone.querySelectorAll('.space-y-6');
        spaceY6.forEach(container => {
            container.style.gap = '0';
            container.style.marginTop = '0';
            const children = container.children;
            for (let child of children) {
                child.style.marginTop = '0';
                child.style.marginBottom = '0.2rem';
            }
        });
        
        // Compact all max-w containers (these have px-4/px-6/px-8 classes)
        const maxWContainers = clone.querySelectorAll('.max-w-7xl');
        maxWContainers.forEach(container => {
            container.style.paddingTop = '0.2rem';
            container.style.paddingBottom = '0.2rem';
            container.style.paddingLeft = '1rem';
            container.style.paddingRight = '1rem';
        });
        
        // Remove padding from all bg-white containers (work exp, education boxes)
        // This targets the p-8 class which adds 2rem padding
        const bgWhiteContainers = clone.querySelectorAll('.bg-white');
        bgWhiteContainers.forEach(container => {
            container.style.padding = '0.5rem';
            container.style.marginBottom = '0.2rem';
        });
        
        // Specifically target the About Me white box
        const aboutWhiteBox = clone.querySelector('#about-section .bg-white');
        if (aboutWhiteBox) {
            aboutWhiteBox.style.padding = '0.5rem';
            aboutWhiteBox.style.marginBottom = '0';
        }
        
        // Target all elements with mb-6 class
        const mb6Elements = clone.querySelectorAll('.mb-6');
        mb6Elements.forEach(el => {
            el.style.marginBottom = '0.2rem';
        });
        
        // Target all elements with pb-4 class
        const pb4Elements = clone.querySelectorAll('.pb-4');
        pb4Elements.forEach(el => {
            el.style.paddingBottom = '0.1rem';
        });
        
        // Target all elements with mt-4 class
        const mt4Elements = clone.querySelectorAll('.mt-4');
        mt4Elements.forEach(el => {
            el.style.marginTop = '0.2rem';
        });
        
        // Temporarily add clone to document for rendering
        clone.style.position = 'absolute';
        clone.style.left = '-9999px';
        clone.style.width = '210mm'; // A4 width
        clone.style.background = 'white';
        clone.style.padding = '10mm';
        document.body.appendChild(clone);
        
        // Wait for all images to load before generating PDF
        const images = clone.querySelectorAll('img');
        await Promise.all(
            Array.from(images).map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = () => {
                        console.warn('Image failed to load:', img.src);
                        resolve(); // Continue even if image fails
                    };
                    // Timeout after 5 seconds
                    setTimeout(resolve, 5000);
                });
            })
        );
        
        // Configure html2canvas
        const canvas = await html2canvas(clone, {
            scale: 2, // Higher quality
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: '#ffffff',
            imageTimeout: 0,
            onclone: function(clonedDoc) {
                // Ensure all images have loaded in the cloned document
                const clonedImages = clonedDoc.querySelectorAll('img');
                clonedImages.forEach(img => {
                    if (img.onerror) {
                        img.style.display = 'none';
                    }
                });
            }
        });
        
        // Remove clone
        document.body.removeChild(clone);
        
        // Create PDF with margins
        const { jsPDF } = window.jspdf;
        const pageWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const margin = 10; // 10mm margin on each side
        const contentWidth = pageWidth - (2 * margin);
        const contentHeight = pageHeight - (2 * margin);
        
        // Calculate dimensions
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / contentWidth;
        const pdfImgHeight = imgHeight / ratio;
        
        // Calculate page height in pixels
        const pageHeightInPixels = contentHeight * ratio;
        
        // Create PDF and slice canvas into pages to avoid duplication
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Create a temporary canvas for slicing
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = imgWidth;
        const ctx = tempCanvas.getContext('2d');
        
        let srcY = 0;
        let pageNum = 0;
        
        while (srcY < imgHeight) {
            // Calculate height for this page
            const sliceHeight = Math.min(pageHeightInPixels, imgHeight - srcY);
            tempCanvas.height = sliceHeight;
            
            // Draw the slice from the main canvas
            ctx.drawImage(
                canvas,
                0, srcY,              // Source x, y
                imgWidth, sliceHeight, // Source width, height
                0, 0,                 // Dest x, y
                imgWidth, sliceHeight  // Dest width, height
            );
            
            // Convert slice to image
            const sliceImgData = tempCanvas.toDataURL('image/jpeg', 0.95);
            
            // Add page if not first
            if (pageNum > 0) {
                pdf.addPage();
            }
            
            // Calculate height in mm for this slice
            const sliceHeightMM = sliceHeight / ratio;
            
            // Add the slice to the PDF
            pdf.addImage(sliceImgData, 'JPEG', margin, margin, contentWidth, sliceHeightMM);
            
            // Move to next slice
            srcY += pageHeightInPixels;
            pageNum++;
        }
        
        // Generate filename with current date
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        const filename = `Guillermo_Caminero_CV_${dateStr}.pdf`;
        
        // Save PDF
        pdf.save(filename);
        
        // Show success message
        button.innerHTML = `
            <svg class="inline w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            PDF Downloaded!
        `;
        
        // Reset button after 2 seconds
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
        }, 2000);
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
        
        // Reset button
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

// Add print functionality as fallback
function printCV() {
    window.print();
}

// Expose print function globally for potential use
window.printCV = printCV;

