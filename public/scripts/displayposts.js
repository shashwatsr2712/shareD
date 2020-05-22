// This script is included in landing and show(profile) pages 

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

    // Enable/Disable button if comment size > 0
    $(".posts:eq(0)").on("input",".comment-section input",function(){
        let comm_elem=$(this);
        if(comm_elem.val()!=''){
            comm_elem.next().children().eq(0).removeAttr("disabled");
        } else{
            comm_elem.next().children().eq(0).attr("disabled","disabled");
        }
    });

    // Posting a new comment 
    $(".posts:eq(0)").on("submit",".comment-section>form",function(event){
        event.preventDefault();
        let comm_input=$(this).find("input").eq(0); // Get comment description element
        let comm_button=$(this).find("button").eq(0); // Get post button element
        // Change submit button style
        comm_button.toggleClass("btn-secondary");
        comm_button.html("Posting...");
        let comm_for=comm_input.attr("data-post-info"); //Post ID
        let comm_desc=comm_input.val();
        let data_post_comm={}; // To be sent in AJAX call
        data_post_comm.description=comm_desc;
        data_post_comm.post_id=comm_for;
        // Save comment in db
        $.ajax({
            type: 'post',
            url: '/addcomment',
            data: data_post_comm,
            dataType: 'json'
        })
        .done(function(data_received_comm){ // Change done in DB
            comm_button.toggleClass("btn-secondary");
            comm_button.html("Post");
        });
    });

    // List all comments for a post
    $(".posts:eq(0)").on("click",".view-all-comments",function(){
        let postID=$(this).attr("data-post-info-2"); // Post ID
        let data_for_post={};
        data_for_post.id=postID;
        $.ajax({
            type: 'post',
            url: '/viewcomments',
            data: data_for_post,
            dataType: 'json'
        })
        .done(function(data_recvd_view_comm){ // Search done in DB
            let elem_modal=$("#commentsShowModal .modal-body:eq(0)"); // Append results to modal body
            elem_modal.empty();
            let to_append='<div class="container">';
            if(data_recvd_view_comm.length==0){
                to_append+='<div class="alert alert-info">Nothing so far...</div>';
            } else{
                data_recvd_view_comm.forEach(function(fComment){
                    to_append+=`<div>
                        <a href="/profile/${fComment.username}" style="text-decoration:none;">
                            ${fComment.username}
                        </a>&nbsp;
                        <small class="text-muted">${fComment.timestamp}</small>
                    <p>${fComment.description}</p>
                    </div><hr/>`;
                });
            }
            to_append+='</div>'
            elem_modal.append(to_append);
            $("#commentsShowModal").modal();
        });
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