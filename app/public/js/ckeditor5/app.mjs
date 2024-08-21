import { installIframeEvent } from './iframeEvent.mjs';

import {
	ClassicEditor,
	AccessibilityHelp,
	Alignment,
	AutoImage,
	AutoLink,
	Autosave,
	Bold,
	CloudServices,
	Essentials,
	FindAndReplace,
	GeneralHtmlSupport,
	HorizontalLine,
	ImageBlock,
	ImageCaption,
	ImageInline,
	ImageInsertViaUrl,
	ImageResize,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	Indent,
	IndentBlock,
	Italic,
	Link,
	LinkImage,
	List,
	ListProperties,
	Paragraph,
	SelectAll,
	SpecialCharacters,
	SpecialCharactersArrows,
	SpecialCharactersCurrency,
	SpecialCharactersEssentials,
	SpecialCharactersLatin,
	SpecialCharactersMathematical,
	SpecialCharactersText,
	Table,
	TableCellProperties,
	TableColumnResize,
	TableProperties,
	TableToolbar,
	Underline,
	Undo
} from 'ckeditor5';

import translations from 'ckeditor5/translations/ko.js';

const editorConfig = {
	toolbar: {
		items: [
			'undo',
			'redo',
			'|',
			'bold',
			'italic',
			'underline',
			'|',
			'specialCharacters',
			'horizontalLine',
			'insertTable',
			'|',
			'alignment',
			'|',
			'bulletedList',
			'numberedList',
			'outdent',
			'indent',
			'|',
			'findAndReplace',
			'selectAll',
			'link',
			'|',
			'accessibilityHelp'
		],
		shouldNotGroupWhenFull: false
	},
	plugins: [
		AccessibilityHelp,
		Alignment,
		AutoImage,
		AutoLink,
		Autosave,
		Bold,
		CloudServices,
		Essentials,
		FindAndReplace,
		GeneralHtmlSupport,
		HorizontalLine,
		ImageBlock,
		ImageCaption,
		ImageInline,
		ImageInsertViaUrl,
		ImageResize,
		ImageStyle,
		ImageToolbar,
		ImageUpload,
		Indent,
		IndentBlock,
		Italic,
		Link,
		LinkImage,
		List,
		ListProperties,
		Paragraph,
		SelectAll,
		SpecialCharacters,
		SpecialCharactersArrows,
		SpecialCharactersCurrency,
		SpecialCharactersEssentials,
		SpecialCharactersLatin,
		SpecialCharactersMathematical,
		SpecialCharactersText,
		Table,
		TableCellProperties,
		TableColumnResize,
		TableProperties,
		TableToolbar,
		Underline,
		Undo
	],
	htmlSupport: {
		allow: [
			{
				name: /^.*$/,
				styles: true,
				attributes: true,
				classes: true
			}
		]
	},
	image: {
		toolbar: [
			'toggleImageCaption',
			'imageTextAlternative',
			'|',
			'imageStyle:inline',
			'imageStyle:wrapText',
			'imageStyle:breakText',
			'|',
			'resizeImage'
		]
	},
	initialData: '<figure class="table" style="width:95%;"><table class="ck-table-resized" style="background-color:hsl( 35, 100%, 80% );border:3px solid hsl( 35, 100%, 80% );"><colgroup><col style="width:100%;"></colgroup><tbody><tr><td><p>&nbsp;</p><p style="margin-left:40px;"><strong>설명</strong></p><p style="margin-left:40px;">&nbsp;</p><p style="margin-left:40px;">&nbsp;</p></td></tr></tbody></table></figure><p>&nbsp;</p><figure class="table" style="width:95%;"><table class="ck-table-resized" style="background-color:hsl( 35, 100%, 80% );border:3px solid hsl( 35, 100%, 80% );"><colgroup><col style="width:100%;"></colgroup><tbody><tr><td><p style="margin-left:40px;">&nbsp;</p><p style="margin-left:40px;"><strong>동작 과정</strong></p><ol><li>&nbsp;시작하기 클릭하기</li><li>&nbsp;</li></ol><p style="margin-left:40px;">&nbsp;</p></td></tr></tbody></table></figure><p>&nbsp;</p><figure class="table" style="width:95%;"><table class="ck-table-resized" style="background-color:hsl( 35, 100%, 80% );border:3px solid hsl( 35, 100%, 80% );"><colgroup><col style="width:100%;"></colgroup><tbody><tr><td><p style="margin-left:40px;"><strong>변수 설명</strong></p></td></tr><tr><td style="background-color:hsl(0, 0%, 100%);"><ul style="list-style-type:disc;"><li>변수 1</li></ul><p style="margin-left:40px;">설명</p><ul style="list-style-type:disc;"><li>변수 2</li></ul><p style="margin-left:40px;">설명</p></td></tr></tbody></table></figure><p>&nbsp;</p><figure class="table" style="width:95%;"><table class="ck-table-resized" style="background-color:hsl( 35, 100%, 80% );border:3px solid hsl( 35, 100%, 80% );"><colgroup><col style="width:47.3%;"><col style="width:52.7%;"></colgroup><tbody><tr><td><p style="margin-left:40px;"><strong>코딩 오브젝트</strong></p></td><td style="background-color:hsl(0, 0%, 100%);"><p style="text-align:center;">오브젝트 명</p></td></tr><tr><td style="background-color:hsl(0, 0%, 100%);" colspan="2"><p style="margin-left:40px;"><strong>지시 사항</strong></p><ul style="list-style-type:disc;"><li>설명</li><li>&nbsp;</li></ul><p>&nbsp;</p><p style="margin-left:40px;"><strong>유의 사항</strong></p><p style="margin-left:40px;">지시 사항에서 설명한 블록만 이용하십시오.</p><p style="margin-left:40px;">그렇지 않은 경우 채점 되지 않습니다.</p><p style="margin-left:40px;">지시 사항 이외의 블록을 변경하였을 경우 "<u>다시 풀기</u>" 버튼을 눌러서 초기화 후 문제를 푸시기 바랍니다.</p></td></tr></tbody></table></figure>',
	language: 'ko',
	link: {
		addTargetToExternalLinks: true,
		defaultProtocol: 'https://',
		decorators: {
			toggleDownloadable: {
				mode: 'manual',
				label: 'Downloadable',
				attributes: {
					download: 'file'
				}
			}
		}
	},
	list: {
		properties: {
			styles: true,
			startIndex: true,
			reversed: true
		}
	},
	placeholder: 'Type or paste your content here!',
	table: {
		contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties']
	},
	translations: [translations]
};


ClassicEditor.create(document.querySelector('#editor'), editorConfig)
	.then((editor) => {
		window.editor = editor;
		installIframeEvent();
	});
