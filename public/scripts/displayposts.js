// This scriptis included in landing and show(profile) pages 

$(document).ready(function(){
    // Handle like/unlike events
    $(".posts:eq(0)").on('click','.like-button',function(){
        let loggedin_or_not=$("#hiddenControlLike").attr("data-control-like");
        let elem=$(this);
        if(!(loggedin_or_not)){ // not logged in; show alert div
            $("#likeWarning").show();
            setTimeout(function(){
                $("#likeWarning").hide("slow");
            },4000);
        } else{ // logged in; do AJAX
        let elem1=elem.next().children().eq(0); // This is the span showing like count
        let change_lc=(Number)(elem1.html()); // Like count displayed currently
        let curr_color=elem.hasClass("liked-color"); // true if color is red (post liked) 
        let id=elem.attr("data-test"); // Get ID of the post (required for AJAX)
        let data={}; // To be sent in AJAX call
        data.id=id;
        if(curr_color==true){ // Red
            data.flag=-1;
            change_lc-=1;
        } else{ // Gray
            data.flag=1;
            change_lc+=1;
        }
        // Change like count in db
        $.ajax({
            type: 'post',
            url: '/modifylike',
            data: data,
            dataType: 'json'
        })
        .done(function(data){ // Change done in DB
            elem.toggleClass("liked-color"); // Change color of like button
            elem1.html(change_lc); // Update like count shown in UI using that particular span element
        });
        }
    });
    
    // Scroll To Top
    $(window).scroll(function () {
        if ($(this).scrollTop()>100) {
            $('#toTop').fadeIn();
        } else {
            $('#toTop').fadeOut();
        }
    });
    $("#toTop").click(function(){
        $('body,html').animate({
            scrollTop:0
        }, 800);
        return false;
    });
});