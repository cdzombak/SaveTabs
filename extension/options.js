// Based on this example: http://code.google.com/chrome/extensions/options.html
// There's probably a cleaner, more extensible way to do this

// tree: array of BookmarksTreeNode
// target: ul selector
function render_subtree(tree, selector) {
    for (var i=0; i<tree.length; ++i) {
        // we only want folders:
        if (tree[i].url) continue;

        $('<li/>', {
            id: 'bookmark-folder-' + tree[i].id
            })
            .data('BookmarkTreeNode', tree[i])
            .appendTo(selector)
            .append('<a href="#">'+tree[i].title+'</a>') // TODO: probably want to sanitize a little here
        ; // &$&^#%&^# jstree requires that there be an <a> here. #wtf

        if (tree[i].children && tree[i].children.length) {
            $('<ul/>', {
                id: 'bookmark-ul-folder-' + tree[i].id
            }).appendTo('#bookmark-folder-' + tree[i].id);

            render_subtree(tree[i].children, '#bookmark-ul-folder-' + tree[i].id);
        }
    }
}

$(document).ready(function() {
    chrome.bookmarks.getTree(function(tree){
        // wish I could use Tempo, but I need to attach jQuery data, and I don't know if Tempo can render recursively
        render_subtree(tree[0].children, '#bookmark-ul-folder-0');

        var savedFolder = '';
        var parentFolder = 'root';
        if (localStorage['bookmarkFolderId']) savedFolder = 'bookmark-folder-' + localStorage['bookmarkFolderId'];
        if (savedFolder != '') parentFolder = 'bookmark-folder-' + $('#'+savedFolder).data('BookmarkTreeNode').parentId;

        $('#bookmark-tree').jstree({
            'core': {
                'initially_open': [ parentFolder ],
                'animation': 100
            },
            'html_data': { "data" : false },
            'themes': { 'theme': 'apple' },
            'ui': {
                'select_limit': 1,
                'selected_parent_close': false,
                'initially_select': [ savedFolder ]
            },
            'plugins' : [ 'themes', 'html_data', 'ui' ]
        });

        $('#bookmark-tree').delegate("a", "click", function(){
            // I wish there were a better way to trigger something onselect in jstree.
            // srsly, wtf, jstree.
            localStorage['bookmarkFolderId'] = $(this).closest('li').data('BookmarkTreeNode').id;
        });
    });
});
