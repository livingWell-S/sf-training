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
 * 取引先責任者入力フォームコンポーネント
 * バリデーション機能を備えた新規取引先責任者レコード作成用の包括的なフォーム
 * 機能:
 * - 入力バリデーション
 * - 成功/エラーメッセージ表示
 * - フォームリセット機能
 * - ローディング状態表示
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
     * 入力フィールドの変更を処理
     * @param {Event} event - 入力変更イベント
     */
    handleInputChange(event) {
        const field = event.target.name;
        const value = event.target.value;

        // 対応するフィールドを更新
        this[field] = value;

        // ユーザーが入力を開始したらメッセージをクリア
        if (this.showSuccess || this.showError) {
            this.showSuccess = false;
            this.showError = false;
        }
    }

    /**
     * フォーム送信を処理
     * @param {Event} event - フォーム送信イベント
     */
    handleSubmit(event) {
        event.preventDefault();

        // すべての必須フィールドをバリデーション
        if (!this.validateForm()) {
            return;
        }

        this.isSaving = true;
        this.showSuccess = false;
        this.showError = false;

        // レコード入力を準備
        const fields = {};
        fields[FIRSTNAME_FIELD.fieldApiName] = this.firstName;
        fields[LASTNAME_FIELD.fieldApiName] = this.lastName;

        // 値がある場合のみオプションフィールドを追加
        if (this.title) fields[TITLE_FIELD.fieldApiName] = this.title;
        if (this.email) fields[EMAIL_FIELD.fieldApiName] = this.email;
        if (this.phone) fields[PHONE_FIELD.fieldApiName] = this.phone;
        if (this.mobilePhone) fields[MOBILE_FIELD.fieldApiName] = this.mobilePhone;
        if (this.department) fields[DEPARTMENT_FIELD.fieldApiName] = this.department;
        if (this.description) fields[DESCRIPTION_FIELD.fieldApiName] = this.description;

        const recordInput = { apiName: CONTACT_OBJECT.objectApiName, fields };

        // レコードを作成
        createRecord(recordInput)
            .then(contact => {
                this.isSaving = false;
                this.showSuccess = true;
                this.successMessage = `取引先責任者「${this.firstName} ${this.lastName}」を正常に作成しました！`;

                // トースト通知を表示
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: '成功',
                        message: '取引先責任者を正常に作成しました',
                        variant: 'success'
                    })
                );

                // 保存成功後にフォームをクリア
                this.handleClear();

                // 成功メッセージを数秒間表示
                setTimeout(() => {
                    this.showSuccess = false;
                }, 5000);
            })
            .catch(error => {
                this.isSaving = false;
                this.showError = true;
                this.errorMessage = this.extractErrorMessage(error);

                // トースト通知を表示
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: '取引先責任者作成エラー',
                        message: this.errorMessage,
                        variant: 'error'
                    })
                );
            });
    }

    /**
     * フォーム入力をバリデーション
     * @returns {boolean} フォームが有効な場合true
     */
    validateForm() {
        const allValid = [...this.template.querySelectorAll('lightning-input')]
            .reduce((validSoFar, inputCmp) => {
                inputCmp.reportValidity();
                return validSoFar && inputCmp.checkValidity();
            }, true);

        if (!allValid) {
            this.showError = true;
            this.errorMessage = '必須フィールドをすべて正しく入力してください。';
        }

        return allValid;
    }

    /**
     * すべてのフォームフィールドをクリア
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

        // すべての入力のバリデーションをリセット
        const inputs = this.template.querySelectorAll('lightning-input, lightning-textarea');
        if (inputs) {
            inputs.forEach(input => {
                input.value = '';
            });
        }
    }

    /**
     * エラーオブジェクトからエラーメッセージを抽出
     * @param {Object} error - エラーオブジェクト
     * @returns {string} エラーメッセージ
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
        return '不明なエラーが発生しました。もう一度お試しください。';
    }
}
