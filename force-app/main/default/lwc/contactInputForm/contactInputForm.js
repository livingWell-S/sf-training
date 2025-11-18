import { LightningElement, track } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import FIRSTNAME_FIELD from '@salesforce/schema/Contact.FirstName';
import LASTNAME_FIELD from '@salesforce/schema/Contact.LastName';
import TITLE_FIELD from '@salesforce/schema/Contact.Title';
import EMAIL_FIELD from '@salesforce/schema/Contact.Email';
import PHONE_FIELD from '@salesforce/schema/Contact.Phone';
import MOBILE_FIELD from '@salesforce/schema/Contact.MobilePhone';
import DEPARTMENT_FIELD from '@salesforce/schema/Contact.Department';
import DESCRIPTION_FIELD from '@salesforce/schema/Contact.Description';

/**
 * Contact Input Form Component
 * A comprehensive form for creating new Contact records with validation
 * Features:
 * - Input validation
 * - Success/Error messaging
 * - Form reset functionality
 * - Loading states
 */
export default class ContactInputForm extends LightningElement {
    @track firstName = '';
    @track lastName = '';
    @track title = '';
    @track email = '';
    @track phone = '';
    @track mobilePhone = '';
    @track department = '';
    @track description = '';
    @track isSaving = false;
    @track showSuccess = false;
    @track showError = false;
    @track successMessage = '';
    @track errorMessage = '';

    /**
     * Handle input field changes
     * @param {Event} event - The input change event
     */
    handleInputChange(event) {
        const field = event.target.name;
        const value = event.target.value;

        // Update the corresponding field
        this[field] = value;

        // Clear messages when user starts typing
        if (this.showSuccess || this.showError) {
            this.showSuccess = false;
            this.showError = false;
        }
    }

    /**
     * Handle form submission
     * @param {Event} event - The form submit event
     */
    handleSubmit(event) {
        event.preventDefault();

        // Validate all required fields
        if (!this.validateForm()) {
            return;
        }

        this.isSaving = true;
        this.showSuccess = false;
        this.showError = false;

        // Prepare the record input
        const fields = {};
        fields[FIRSTNAME_FIELD.fieldApiName] = this.firstName;
        fields[LASTNAME_FIELD.fieldApiName] = this.lastName;

        // Add optional fields only if they have values
        if (this.title) fields[TITLE_FIELD.fieldApiName] = this.title;
        if (this.email) fields[EMAIL_FIELD.fieldApiName] = this.email;
        if (this.phone) fields[PHONE_FIELD.fieldApiName] = this.phone;
        if (this.mobilePhone) fields[MOBILE_FIELD.fieldApiName] = this.mobilePhone;
        if (this.department) fields[DEPARTMENT_FIELD.fieldApiName] = this.department;
        if (this.description) fields[DESCRIPTION_FIELD.fieldApiName] = this.description;

        const recordInput = { apiName: CONTACT_OBJECT.objectApiName, fields };

        // Create the record
        createRecord(recordInput)
            .then(contact => {
                this.isSaving = false;
                this.showSuccess = true;
                this.successMessage = `Contact "${this.firstName} ${this.lastName}" created successfully!`;

                // Show toast notification
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Contact created successfully',
                        variant: 'success'
                    })
                );

                // Clear the form after successful save
                this.handleClear();

                // Keep success message visible for a few seconds
                setTimeout(() => {
                    this.showSuccess = false;
                }, 5000);
            })
            .catch(error => {
                this.isSaving = false;
                this.showError = true;
                this.errorMessage = this.extractErrorMessage(error);

                // Show toast notification
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating contact',
                        message: this.errorMessage,
                        variant: 'error'
                    })
                );
            });
    }

    /**
     * Validate form inputs
     * @returns {boolean} True if form is valid
     */
    validateForm() {
        const allValid = [...this.template.querySelectorAll('lightning-input')]
            .reduce((validSoFar, inputCmp) => {
                inputCmp.reportValidity();
                return validSoFar && inputCmp.checkValidity();
            }, true);

        if (!allValid) {
            this.showError = true;
            this.errorMessage = 'Please complete all required fields correctly.';
        }

        return allValid;
    }

    /**
     * Clear all form fields
     */
    handleClear() {
        this.firstName = '';
        this.lastName = '';
        this.title = '';
        this.email = '';
        this.phone = '';
        this.mobilePhone = '';
        this.department = '';
        this.description = '';
        this.showSuccess = false;
        this.showError = false;

        // Reset validation on all inputs
        const inputs = this.template.querySelectorAll('lightning-input, lightning-textarea');
        if (inputs) {
            inputs.forEach(input => {
                input.value = '';
            });
        }
    }

    /**
     * Extract error message from error object
     * @param {Object} error - The error object
     * @returns {string} The error message
     */
    extractErrorMessage(error) {
        if (error.body) {
            if (error.body.message) {
                return error.body.message;
            }
            if (error.body.pageErrors && error.body.pageErrors.length > 0) {
                return error.body.pageErrors[0].message;
            }
            if (error.body.fieldErrors) {
                const fieldErrors = Object.values(error.body.fieldErrors);
                if (fieldErrors.length > 0 && fieldErrors[0].length > 0) {
                    return fieldErrors[0][0].message;
                }
            }
        }
        return 'An unknown error occurred. Please try again.';
    }
}
