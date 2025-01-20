var modal;

export function installModalProgress() {
    const container = document.getElementById('EntryModalContainer');
    modal = new EntryTool.ModalProgress({
        container,
        isShow: false,
        theme: 'entry',
    });
}

export function openModalProgress(title) {
    modal.show({
        title,
        type: 'progress',
    });
}

export function closeModalProgress() {
    modal.hide();
}
