// handle change in user search input at page top
var inp_top="";
function handleSearchChangeHead(elem){
    inp_top=elem.value;
}
// Show form at page top when link is clicked
function showSearchFormHead(){
    $("#profileSearchFormHead").slideToggle(400);
};

// handle change in user search input in footer
var inp="";
function handleSearchChange(elem){
    inp=elem.value;
}
// Show form in footer when link is clicked
function showSearchForm(){
    $("#profileSearchForm").toggle(200);
};

$(document).ready(function(){
    // Event handler for show/hide password
    $("#showHidePassword").click(function(){
        let show_icon=$(this);
        let password_field=show_icon.prev();
        let type=password_field.attr("type");
        if(type=="password"){
            type="text";
            show_icon.removeClass("fa-eye-slash");
            show_icon.addClass("fa-eye");
            show_icon.attr("title","Hide Password");
        } else{
            type="password";
            show_icon.removeClass("fa-eye");
            show_icon.addClass("fa-eye-slash");
            show_icon.attr("title","Show Password");
        }
        password_field.attr("type",type);
    })

    // User Search Form (footer) submission behaviour 
    $(".profile-search-form>form").submit(function(event){
        event.preventDefault();
        let check=$(this).parent().attr("id"); // This is to check if top or bottom form is used 
        let submit_button=$(this).find("button"); // Form submit button
        submit_button.toggleClass("btn-secondary");
        submit_button.attr("disabled","disabled");
        data={};
        if(check=="profileSearchForm"){ // Footer form is used
            data.search=inp;
        } else{
            data.search=inp_top;
        }
        $.ajax({
            type: 'post',
            url: '/searchusers',
            data: data,
            dataType: 'json'
        })
        .done(function(data_recvd){ // Search done in DB
            submit_button.toggleClass("btn-secondary");
            submit_button.removeAttr("disabled");
            let elem1=$("#userSearchModal .modal-body:eq(0)"); // Append results to modal body
            elem1.empty();
            let to_be_appended='<div class="list-group">';
            if(data_recvd.length==0){
                to_be_appended+='<li class="list-group-item list-group-item-danger">Nothing found...</li>'
            } else{
                data_recvd.forEach(function(fUser){
                    to_be_appended+=`
                        <a href="/profile/${fUser.username}" class="list-group-item list-group-item-info" style="text-decoration:none;">
                            <img class="rounded-circle" src="/uploads/${fUser.photo.originalname}" style="max-width:80px;height:38px;"/>&nbsp;&nbsp;
                            <span style="display:inline;">${fUser.username}</span>
                        </a><br/>
                    `
                });
            }
            to_be_appended+='</div>'
            elem1.append(to_be_appended);
            $("#userSearchModal").modal();
        });
    });
})