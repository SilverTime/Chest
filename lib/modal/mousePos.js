/**
 * Created by Administrator on 2015/7/20 0020.
 */
define('mousePos',function(){
//抓取位置的函数
    function mousePosition(evt){
        var xPos,yPos;
        evt=evt || window.event;
        if(evt.pageX){
            xPos=evt.pageX;
            yPos=evt.pageY;
        } else {
            xPos=evt.clientX+document.body.scrollLeft -document.body.clientLeft;
            yPos=evt.clientY+document.body.scrollTop-document.body.clientTop;
        }
        return {x:xPos, y:yPos};
    }

    window.mousePos={x:0,y:0}
    window.document.onmousemove=function(evt){
        window.mousePos=mousePosition(evt)
    }

    return mousePosition
})