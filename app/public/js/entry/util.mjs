export function getSidebarTemplate({ category }) {
    let template = {};
    const cate = {};
    const langKey = 'ko';

    category.map((item) => {
        const { id, name, label, value } = item;

        let sub = { all: { id: '', name: Lang.Menus.all, value: 'all' } };
        const subCate = {};
        item.children.map((subItem) => {
            const { id: subId, name: subName, value: subValue, label: subLabel } = subItem;
            subCate[subValue] = {
                id: subId,
                name: subLabel[langKey] || subName,
                value: subValue,
            };
        });

        sub = { ...sub, ...subCate };

        cate[value] = { id, name: label[langKey] || name, value, sub };
    });
    template = { ...template, ...cate };

    return template;
}
