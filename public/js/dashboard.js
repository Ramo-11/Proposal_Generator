let currentEditingId = null;

// Modal functions
function openModal(proposalId = null) {
    const modal = document.getElementById('proposalModal');
    const form = document.getElementById('proposalForm');
    const title = document.getElementById('modalTitle');
    
    modal.style.display = 'block';
    
    if (proposalId) {
        // Edit mode
        currentEditingId = proposalId;
        title.textContent = 'Edit Proposal';
        loadProposalData(proposalId);
    } else {
        // Create mode
        currentEditingId = null;
        title.textContent = 'Create New Proposal';
        form.reset();
    }
}

function closeModal() {
    const modal = document.getElementById('proposalModal');
    modal.style.display = 'none';
    currentEditingId = null;
    document.getElementById('proposalForm').reset();
}

// Load proposal data for editing
async function loadProposalData(proposalId) {
    try {
        const response = await fetch(`/proposal/${proposalId}`);
        const proposal = await response.json();
        
        if (proposal) {
            document.getElementById('business_name').value = proposal.business_name || '';
            document.getElementById('contact_person').value = proposal.contact_person || '';
            document.getElementById('contact_email').value = proposal.contact_email || '';
            document.getElementById('contact_phone').value = proposal.contact_phone || '';
            document.getElementById('project_type').value = proposal.project_type || '';
            document.getElementById('timeline').value = proposal.timeline || '';
            document.getElementById('budget').value = proposal.budget || '';
            document.getElementById('features').value = proposal.features || '';
            document.getElementById('technical_highlights').value = proposal.technical_highlights || '';
        }
    } catch (error) {
        console.error('Error loading proposal data:', error);
        showNotification('Error loading proposal data', 'error');
    }
}

function viewHTML(id) {
    window.open(`/proposal/${id}/html`, '_blank');
}

// Form submission
document.getElementById('proposalForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
        let response;
        
        if (currentEditingId) {
            // Update existing proposal
            response = await fetch(`/proposal/${currentEditingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
        } else {
            // Create new proposal
            response = await fetch('/proposal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
        }
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(
                currentEditingId ? 'Proposal updated successfully!' : 'Proposal created successfully!',
                'success'
            );
            closeModal();
            // Reload page to show changes
            window.location.reload();
        } else {
            throw new Error(result.error || 'Operation failed');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error: ' + error.message, 'error');
    }
});

// Edit proposal
function editProposal(id) {
    openModal(id);
}

// Delete proposal
async function deleteProposal(id) {
    if (!confirm('Are you sure you want to delete this proposal?')) {
        return;
    }
    
    try {
        const response = await fetch(`/proposal/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Proposal deleted successfully!', 'success');
            // Remove card from DOM
            const card = document.querySelector(`[onclick*="${id}"]`).closest('.proposal-card');
            if (card) {
                card.remove();
            }
            // Reload to update stats
            setTimeout(() => window.location.reload(), 1000);
        } else {
            throw new Error(result.error || 'Delete failed');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error deleting proposal: ' + error.message, 'error');
    }
}

// Download PDF
function downloadPDF(id) {
    showNotification('Generating PDF...', 'info');
    window.open(`/proposal/${id}/pdf`, '_blank');
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Add notification styles
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1001;
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 300px;
        animation: slideIn 0.3s ease;
    }
    
    .notification-success {
        background-color: #10b981;
    }
    
    .notification-error {
        background-color: #ef4444;
    }
    
    .notification-info {
        background-color: #3b82f6;
    }
    
    .notification button {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @media (max-width: 768px) {
        .notification {
            left: 20px;
            right: 20px;
            min-width: auto;
        }
    }
`;

// Add styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('proposalModal');
    if (e.target === modal) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Form validation
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('proposalForm');
    const inputs = form.querySelectorAll('input[required], select[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearValidation);
    });
});

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    if (field.type === 'email' && value && !isValidEmail(value)) {
        showFieldError(field, 'Please enter a valid email address');
        return false;
    }
    
    clearFieldError(field);
    return true;
}

function clearValidation(e) {
    clearFieldError(e.target);
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    const error = document.createElement('span');
    error.className = 'field-error';
    error.textContent = message;
    error.style.color = '#ef4444';
    error.style.fontSize = '12px';
    error.style.marginTop = '5px';
    
    field.parentElement.appendChild(error);
    field.style.borderColor = '#ef4444';
}

function clearFieldError(field) {
    const error = field.parentElement.querySelector('.field-error');
    if (error) {
        error.remove();
    }
    field.style.borderColor = '';
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Auto-save draft functionality (optional)
let draftTimeout;
function saveDraft() {
    const form = document.getElementById('proposalForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Only save if there's actual content
    if (data.business_name || data.contact_person || data.project_type) {
        localStorage.setItem('proposalDraft', JSON.stringify(data));
    }
}

// Load draft on modal open
function loadDraft() {
    const draft = localStorage.getItem('proposalDraft');
    if (draft && !currentEditingId) {
        const data = JSON.parse(draft);
        Object.keys(data).forEach(key => {
            const field = document.getElementById(key);
            if (field && data[key]) {
                field.value = data[key];
            }
        });
    }
}

// Clear draft on successful submission
function clearDraft() {
    localStorage.removeItem('proposalDraft');
}

// Add auto-save listeners
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('proposalForm');
    if (form) {
        form.addEventListener('input', () => {
            clearTimeout(draftTimeout);
            draftTimeout = setTimeout(saveDraft, 2000);
        });
    }
});