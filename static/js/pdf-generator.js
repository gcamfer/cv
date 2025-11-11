/**
 * PDF Generator
 * Generates PDF from CV page using jsPDF and html2canvas
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
        
        // Remove no-print elements from clone
        const noPrintElements = clone.querySelectorAll('.no-print');
        noPrintElements.forEach(el => el.remove());
        
        // Temporarily add clone to document for rendering
        clone.style.position = 'absolute';
        clone.style.left = '-9999px';
        clone.style.width = '210mm'; // A4 width
        clone.style.background = 'white';
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
        
        // Create PDF
        const { jsPDF } = window.jspdf;
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        let position = 0;
        
        // Add image to PDF
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // Add new pages if content is longer than one page
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
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

