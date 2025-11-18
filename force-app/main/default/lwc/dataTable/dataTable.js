import { LightningElement, track, wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';

/**
 * 多機能データテーブルコンポーネント
 * 検索、ソート、ページネーション機能を提供
 */
export default class DataTable extends LightningElement {
    // データテーブルの列定義
    columns = [
        {
            label: '名前',
            fieldName: 'name',
            type: 'text',
            sortable: true,
            cellAttributes: { class: 'slds-text-title_bold' }
        },
        {
            label: 'メールアドレス',
            fieldName: 'email',
            type: 'email',
            sortable: true
        },
        {
            label: '電話番号',
            fieldName: 'phone',
            type: 'phone',
            sortable: true
        },
        {
            label: '役職',
            fieldName: 'title',
            type: 'text',
            sortable: true
        },
        {
            label: 'ステータス',
            fieldName: 'status',
            type: 'text',
            sortable: true,
            cellAttributes: {
                class: { fieldName: 'statusClass' }
            }
        },
        {
            type: 'action',
            typeAttributes: {
                rowActions: [
                    { label: '表示', name: 'view' },
                    { label: '編集', name: 'edit' },
                    { label: '削除', name: 'delete' }
                ]
            }
        }
    ];

    // サンプルデータ（実際のプロジェクトではApexから取得）
    allData = [
        {
            id: '1',
            name: '山田 太郎',
            email: 'yamada.taro@example.com',
            phone: '03-1234-5678',
            title: '営業部長',
            status: 'アクティブ',
            statusClass: 'slds-text-color_success'
        },
        {
            id: '2',
            name: '佐藤 花子',
            email: 'sato.hanako@example.com',
            phone: '03-2345-6789',
            title: 'マーケティングマネージャー',
            status: 'アクティブ',
            statusClass: 'slds-text-color_success'
        },
        {
            id: '3',
            name: '鈴木 一郎',
            email: 'suzuki.ichiro@example.com',
            phone: '03-3456-7890',
            title: 'エンジニア',
            status: '休暇中',
            statusClass: 'slds-text-color_default'
        },
        {
            id: '4',
            name: '田中 美咲',
            email: 'tanaka.misaki@example.com',
            phone: '03-4567-8901',
            title: 'デザイナー',
            status: 'アクティブ',
            statusClass: 'slds-text-color_success'
        },
        {
            id: '5',
            name: '高橋 健太',
            email: 'takahashi.kenta@example.com',
            phone: '03-5678-9012',
            title: 'プロダクトマネージャー',
            status: '非アクティブ',
            statusClass: 'slds-text-color_error'
        },
        {
            id: '6',
            name: '伊藤 さくら',
            email: 'ito.sakura@example.com',
            phone: '03-6789-0123',
            title: '人事担当',
            status: 'アクティブ',
            statusClass: 'slds-text-color_success'
        },
        {
            id: '7',
            name: '渡辺 大輔',
            email: 'watanabe.daisuke@example.com',
            phone: '03-7890-1234',
            title: '財務担当',
            status: 'アクティブ',
            statusClass: 'slds-text-color_success'
        },
        {
            id: '8',
            name: '中村 愛',
            email: 'nakamura.ai@example.com',
            phone: '03-8901-2345',
            title: 'カスタマーサポート',
            status: '休暇中',
            statusClass: 'slds-text-color_default'
        }
    ];

    @track data = []; // 表示するデータ
    @track sortedBy; // ソート対象の列
    @track sortDirection = 'asc'; // ソート方向
    @track searchKey = ''; // 検索キーワード
    @track selectedRows = []; // 選択された行

    // ページネーション用のプロパティ
    @track pageSize = 5; // 1ページあたりの行数
    @track currentPage = 1; // 現在のページ番号
    @track totalPages = 1; // 総ページ数
    @track totalRecords = 0; // 総レコード数

    /**
     * コンポーネント初期化時の処理
     */
    connectedCallback() {
        this.loadData();
    }

    /**
     * データの読み込みと初期表示の設定
     */
    loadData() {
        this.totalRecords = this.allData.length;
        this.calculateTotalPages();
        this.updateDisplayData();
    }

    /**
     * 総ページ数を計算
     */
    calculateTotalPages() {
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
    }

    /**
     * 表示データを更新（検索、ソート、ページネーションを適用）
     */
    updateDisplayData() {
        let filteredData = [...this.allData];

        // 検索フィルターを適用
        if (this.searchKey) {
            const searchLower = this.searchKey.toLowerCase();
            filteredData = filteredData.filter(row => {
                return Object.values(row).some(value =>
                    String(value).toLowerCase().includes(searchLower)
                );
            });
        }

        // 総レコード数を更新
        this.totalRecords = filteredData.length;
        this.calculateTotalPages();

        // 現在のページが総ページ数を超えている場合は最初のページに戻る
        if (this.currentPage > this.totalPages) {
            this.currentPage = 1;
        }

        // ソートを適用
        if (this.sortedBy) {
            filteredData = this.sortData(filteredData, this.sortedBy, this.sortDirection);
        }

        // ページネーションを適用
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        this.data = filteredData.slice(startIndex, endIndex);
    }

    /**
     * データをソート
     * @param {Array} data - ソート対象のデータ
     * @param {String} fieldName - ソート対象のフィールド名
     * @param {String} direction - ソート方向（'asc' または 'desc'）
     * @returns {Array} ソートされたデータ
     */
    sortData(data, fieldName, direction) {
        const parseData = JSON.parse(JSON.stringify(data));
        const keyValue = (a) => {
            return a[fieldName];
        };
        const isReverse = direction === 'asc' ? 1 : -1;
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : '';
            y = keyValue(y) ? keyValue(y) : '';
            return isReverse * ((x > y) - (y > x));
        });
        return parseData;
    }

    /**
     * ソートイベントのハンドラー
     * @param {Event} event - ソートイベント
     */
    handleSort(event) {
        this.sortedBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.updateDisplayData();
    }

    /**
     * 検索キーワード入力時のハンドラー
     * @param {Event} event - 入力イベント
     */
    handleSearch(event) {
        this.searchKey = event.target.value;
        this.currentPage = 1; // 検索時は最初のページに戻る
        this.updateDisplayData();
    }

    /**
     * 検索をクリア
     */
    handleClearSearch() {
        this.searchKey = '';
        this.currentPage = 1;
        this.updateDisplayData();
    }

    /**
     * 行選択時のハンドラー
     * @param {Event} event - 選択イベント
     */
    handleRowSelection(event) {
        this.selectedRows = event.detail.selectedRows;
        // 選択された行の情報をコンソールに表示
        console.log('選択された行数: ' + this.selectedRows.length);
    }

    /**
     * 行アクション実行時のハンドラー
     * @param {Event} event - アクションイベント
     */
    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        switch (actionName) {
            case 'view':
                this.handleView(row);
                break;
            case 'edit':
                this.handleEdit(row);
                break;
            case 'delete':
                this.handleDelete(row);
                break;
            default:
                break;
        }
    }

    /**
     * 表示アクション
     * @param {Object} row - 対象の行データ
     */
    handleView(row) {
        console.log('表示: ', row);
        // 実際のプロジェクトでは、詳細ページへの遷移やモーダル表示などを実装
    }

    /**
     * 編集アクション
     * @param {Object} row - 対象の行データ
     */
    handleEdit(row) {
        console.log('編集: ', row);
        // 実際のプロジェクトでは、編集フォームの表示などを実装
    }

    /**
     * 削除アクション
     * @param {Object} row - 対象の行データ
     */
    handleDelete(row) {
        console.log('削除: ', row);
        // 実際のプロジェクトでは、確認ダイアログと削除処理を実装
    }

    /**
     * 前のページへ移動
     */
    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updateDisplayData();
        }
    }

    /**
     * 次のページへ移動
     */
    handleNext() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.updateDisplayData();
        }
    }

    /**
     * 最初のページへ移動
     */
    handleFirst() {
        this.currentPage = 1;
        this.updateDisplayData();
    }

    /**
     * 最後のページへ移動
     */
    handleLast() {
        this.currentPage = this.totalPages;
        this.updateDisplayData();
    }

    /**
     * ページサイズ変更時のハンドラー
     * @param {Event} event - 変更イベント
     */
    handlePageSizeChange(event) {
        this.pageSize = parseInt(event.target.value, 10);
        this.currentPage = 1; // ページサイズ変更時は最初のページに戻る
        this.updateDisplayData();
    }

    /**
     * 前のページボタンの無効化判定
     * @returns {Boolean} ボタンを無効化するかどうか
     */
    get isPreviousDisabled() {
        return this.currentPage <= 1;
    }

    /**
     * 次のページボタンの無効化判定
     * @returns {Boolean} ボタンを無効化するかどうか
     */
    get isNextDisabled() {
        return this.currentPage >= this.totalPages;
    }

    /**
     * ページネーション情報の表示テキスト
     * @returns {String} ページネーション情報
     */
    get paginationInfo() {
        const startRecord = (this.currentPage - 1) * this.pageSize + 1;
        const endRecord = Math.min(this.currentPage * this.pageSize, this.totalRecords);
        return `${startRecord} - ${endRecord} 件 / 全 ${this.totalRecords} 件`;
    }

    /**
     * ページサイズの選択肢
     * @returns {Array} ページサイズのオプション配列
     */
    get pageSizeOptions() {
        return [
            { label: '5件', value: '5' },
            { label: '10件', value: '10' },
            { label: '25件', value: '25' },
            { label: '50件', value: '50' }
        ];
    }

    /**
     * 検索キーワードが入力されているか
     * @returns {Boolean} 検索キーワードの有無
     */
    get hasSearchKey() {
        return this.searchKey && this.searchKey.length > 0;
    }

    /**
     * 選択された行数のテキスト
     * @returns {String} 選択された行数
     */
    get selectedRowsText() {
        return this.selectedRows.length > 0
            ? `${this.selectedRows.length} 件選択中`
            : '';
    }
}
