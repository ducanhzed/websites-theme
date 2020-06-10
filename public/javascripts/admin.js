let timeOutHolder;

$("#loginForm").on('submit', function () {
    $('#loginForm > button').html('<i class="fas fa-circle-notch fa-spin"></i>');
    $("#loginForm > button").addClass('inactive');

    const name = $("#loginForm input[name='name']").val();
    const password = $("#loginForm input[name='password']").val();
    const csrf = $("#loginForm input[name='_csrf']").val();

    $.ajax({
        url: '/admin/login',
        method: 'POST',
        data: { name, password, _csrf: csrf },
        success: function (response) {
            $('.message').removeClass('active');
            const url = response.oldUrl ? response.oldUrl : '/admin';
            return window.location.href = url;
        },
        error: function (response) {
            clearTimeout(timeOutHolder);
            $('.message').html('<p class="title">Error</p><p>' + response.responseJSON.message + '</p>');
            $('.message').addClass('active');
            timeOutHolder = setTimeout(() => $('.message').removeClass('active'), 3000);

            $("#loginForm > button").removeClass('inactive');
            $("#loginForm > button").html('SIGN IN');
        }
    });

    return false;
})