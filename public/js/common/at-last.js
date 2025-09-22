function replaceTextInNode(node, search, replace) {
    if (node.nodeType === 3) {
        node.nodeValue = node.nodeValue.replaceAll(search, replace);
    } else {
        node.childNodes.forEach(child => replaceTextInNode(child, search, replace));
    }
}

replaceTextInNode(document.body, "QuickCart", "Trolley");
replaceTextInNode(document.head, "QuickCart", "Trolley");