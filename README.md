jSelect
=======

实现自定义的select表单选择框控件：样式根据给定的css而表现，同时，保持select的onblure事件。

<h2>控件简介</h2>
<div>
	一个jquery控件，实现自定义select样式的功能，同时保证select控件的交互功能。
</div>
<h2>使用说明</h2>
<div>
	样式的自定义全部用css处理，位于css/jSelect.css，只需要修改相应的class名的属性就可以了。
</div>
<div>
	此控件支持键盘操作，基本仿照原生的select控件的交互来开发。当改变控件当前的选择值的时候会自动触发原生select的blur事件，
	所以只需要用jQuery监听原生select的blur事件，就可以保证onblur事件的准确触发。
</div>
<div>
	为了保证下拉选择菜单被隐藏：某些情况下，某些元素会使用overflow:hidden，为避免这种情况，下拉菜单的元素直接追加到页面中body最后
	一个元素后，最大程度的保证正常使用！
</div>
<div>
	代码初次发布，如有不足，欢迎指正，O(∩_∩)O
</div>