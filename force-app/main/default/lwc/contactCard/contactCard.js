import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

// Contact fields to retrieve
const FIELDS = [
    'Contact.FirstName',
    'Contact.LastName',
    'Contact.Title',
    'Contact.Email',
    'Contact.Phone',
    'Contact.MobilePhone',
    'Contact.Account.Name',
    'Contact.Department'
];

/**
 * Contact Card Component
 * Displays contact information in a clean card layout
 * Can be placed on Contact record pages or used with recordId input
 */
export default class ContactCard extends LightningElement {
    @api recordId;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    contact;

    /**
     * Get full name of contact
     */
    get fullName() {
        const firstName = getFieldValue(this.contact.data, 'Contact.FirstName');
        const lastName = getFieldValue(this.contact.data, 'Contact.LastName');
        return `${firstName || ''} ${lastName || ''}`.trim();
    }

    /**
     * Get contact title
     */
    get title() {
        return getFieldValue(this.contact.data, 'Contact.Title');
    }

    /**
     * Get contact email
     */
    get email() {
        return getFieldValue(this.contact.data, 'Contact.Email');
    }

    /**
     * Get mailto link for email
     */
    get emailLink() {
        return this.email ? `mailto:${this.email}` : '';
    }

    /**
     * Get contact phone
     */
    get phone() {
        return getFieldValue(this.contact.data, 'Contact.Phone');
    }

    /**
     * Get tel link for phone
     */
    get phoneLink() {
        return this.phone ? `tel:${this.phone}` : '';
    }

    /**
     * Get contact mobile phone
     */
    get mobilePhone() {
        return getFieldValue(this.contact.data, 'Contact.MobilePhone');
    }

    /**
     * Get tel link for mobile phone
     */
    get mobileLink() {
        return this.mobilePhone ? `tel:${this.mobilePhone}` : '';
    }

    /**
     * Get account name
     */
    get accountName() {
        return getFieldValue(this.contact.data, 'Contact.Account.Name');
    }

    /**
     * Get department
     */
    get department() {
        return getFieldValue(this.contact.data, 'Contact.Department');
    }
}
