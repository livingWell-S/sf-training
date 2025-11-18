import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

// 取得する取引先責任者のフィールド
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
 * 取引先責任者カードコンポーネント
 * 取引先責任者情報をきれいなカードレイアウトで表示
 * 取引先責任者レコードページに配置するか、recordId入力で使用可能
 */
export default class ContactCard extends LightningElement {
    @api recordId;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    contact;

    /**
     * 取引先責任者のフルネームを取得
     */
    get fullName() {
        const firstName = getFieldValue(this.contact.data, 'Contact.FirstName');
        const lastName = getFieldValue(this.contact.data, 'Contact.LastName');
        return `${firstName || ''} ${lastName || ''}`.trim();
    }

    /**
     * 取引先責任者の役職を取得
     */
    get title() {
        return getFieldValue(this.contact.data, 'Contact.Title');
    }

    /**
     * 取引先責任者のメールアドレスを取得
     */
    get email() {
        return getFieldValue(this.contact.data, 'Contact.Email');
    }

    /**
     * メールアドレスのmailtoリンクを取得
     */
    get emailLink() {
        return this.email ? `mailto:${this.email}` : '';
    }

    /**
     * 取引先責任者の電話番号を取得
     */
    get phone() {
        return getFieldValue(this.contact.data, 'Contact.Phone');
    }

    /**
     * 電話番号のtelリンクを取得
     */
    get phoneLink() {
        return this.phone ? `tel:${this.phone}` : '';
    }

    /**
     * 取引先責任者の携帯電話番号を取得
     */
    get mobilePhone() {
        return getFieldValue(this.contact.data, 'Contact.MobilePhone');
    }

    /**
     * 携帯電話番号のtelリンクを取得
     */
    get mobileLink() {
        return this.mobilePhone ? `tel:${this.mobilePhone}` : '';
    }

    /**
     * 取引先名を取得
     */
    get accountName() {
        return getFieldValue(this.contact.data, 'Contact.Account.Name');
    }

    /**
     * 部門を取得
     */
    get department() {
        return getFieldValue(this.contact.data, 'Contact.Department');
    }
}
