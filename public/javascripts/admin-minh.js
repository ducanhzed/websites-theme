// Login Form 
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

// $('.scrollbar-sidebar a').each(function () {
//     const element = $(this);
//     if (element.attr('href') === window.location.pathname)
//         element.addClass('mm-active');
// })

// Aria-expand -> list sidebar



// Content of create-news
if ($('#content').length) {
    CKEDITOR.replace('content');
}

// Choose Input Checkbox for All
$(document).on('change', 'th input[type="checkbox"]', function () {
    const checked = $(this).attr('data-checked');
    if (checked === 'all' && $(this).prop('checked') === false) {
        $(this).parents('table').find('tbody > tr').removeClass('active');
        $(this).parents('table').find('tbody > tr input[type="checkbox"]').prop('checked', false);
        $('.btn-remove').addClass('disabled');
    } else if (checked === 'all' && $(this).prop('checked') === true) {
        $(this).parents('table').find('tbody > tr').addClass('active');
        $(this).parents('table').find('tbody > tr input[type="checkbox"]').prop('checked', true);
        $('.btn-remove').removeClass('disabled');
    }
})

// Choose Input Checkbox for One Row
$(document).on('change', 'td input[type="checkbox"]', function () {
    const id = '#' + $(this).attr('data-id');
    if (id) $(id).toggleClass('active');

    if ($('tr.active').length) $('.btn-remove').removeClass('disabled');
    else $('.btn-remove').addClass('disabled');
});

// Ajax Find Field, Color, Country, Trend for Create Website
$('.ajax-find').on('input', function () {
    const _csrf = $('input[name="_csrf"]').val();
    const value = $(this).val();
    const find = $(this).attr('data-find');

    const listId = '#' + $(this).attr('list');
    $.ajax({
        url: '/admin/find/' + find,
        method: "POST",
        data: { _csrf, value },
        success: function (res) {
            $(listId).html('');
            if (res.data.length) $(listId).removeClass('disabled');
            else $(listId).addClass('disabled');

            res.data.forEach(element => {
                $(listId).append('<p class="input-dropdown-element" data-dest="' + listId.slice(1) + '" data-value="' + element.name + '">' + element.name + '</p>')
            });
        },
        error: function (err) {
            console.log(err);
        }
    });
})

// Dropdown Menu when Ajax Find Complete
$(document).on('click', '.input-dropdown-element', function (e) {
    const input = $(this).attr('data-dest');
    const value = $(this).attr('data-value');
    $('input[list="' + input + '"]').val(value);
    $(this).parent().addClass('disabled');
    e.stopPropagation();
});

$(document).on('click', function () {
    $('.inputDropdown').addClass('disabled');
});

// Handle Create Website / News
$(document).on('submit', 'form.form_create', function (e) {
    //AJAX SUBMIT
    return false;
});

// Handle Search Property
$(document).on('submit', 'form.form_search_property', function (e) {
    $('table tbody').html('<tr><td colspan="4" style="padding: 100px 0"><div class="center"><div class="sbl-circ"></div></div></td></tr>');
    $('#totalCountDocument').html('');
    $('#countDocument').html('');
    if ($('#load_more button').length) $('#load_more button').attr('data-name', $(this).find('input').val());

    $.ajax({
        url: $(this).attr('action') + '?name=' + $(this).find('input').val(),
        success: function (res) {
            $('table tbody').html('');
            res.data.forEach(property => {
                $('table tbody').append(`
                        <tr id="${property._id}">
                        <td class="text-center">
                            <div class="widget-content px-1 py-0">
                                <input type="checkbox" class="" data-id="${property._id}" />
                            </div>
                        </td>
                        <td>
                            <div class="widget-content p-0">
                                <div class="widget-content-wrapper">
                                    <div class="widget-content-left flex2">
                                        <div class="widget-heading">${property.name}</div>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td class="text-center">${property.quantity}</td>
                        <td class="text-center">
                            <button type="button" id="PopoverCustomT-1" class="btn btn-primary btn-sm" data-toggle="modal" data-target="#modify" data-id="${property._id}" data-name="${property.name}">Modify</button>
                        </td>
                    </tr>
                `);
            });
            $('#totalCountDocument').html(res.totalCount);
            $('#countDocument').html(res.count);
            if ($('#load_more').length) {
                if (res.count < res.totalCount) $('#load_more').addClass('d-block').removeClass('d-none');
                else $('#load_more').removeClass('d-block').addClass('d-none');
            }
        }, error: function (err) {
            $('table tbody').html('<tr><td colspan="4" style="padding: 100px 0"><p class="m-0 w-100 text-center font-weight-bold">Error</p></td></tr>');
            console.log(err);
        }
    })
    return false;
})

// Load more property 
$(document).on('click', '#load_more > button', function (e) {
    const button = this
    const form = $('form.form_search_property');
    const skip = $('table tbody > tr').length;
    $(this).html('Loading...');
    $(this).addClass('disabled');

    $.ajax({
        url: $(form).attr('action') + '?name=' + $(this).attr('data-name') + '&skip=' + skip,
        success: function (res) {
            res.data.forEach(property => {
                $('table tbody').append(`
                        <tr id="${property._id}">
                        <td class="text-center">
                            <div class="widget-content px-1 py-0">
                                <input type="checkbox" class="" data-id="${property._id}" />
                            </div>
                        </td>
                        <td>
                            <div class="widget-content p-0">
                                <div class="widget-content-wrapper">
                                    <div class="widget-content-left flex2">
                                        <div class="widget-heading">${property.name}</div>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td class="text-center">${property.quantity}</td>
                        <td class="text-center">
                            <button type="button" id="PopoverCustomT-1" class="btn btn-primary btn-sm" data-toggle="modal" data-target="#modify" data-id="${property._id}" data-name="${property.name}">Modify</button>
                        </td>
                    </tr>
                `);
            });
            $('#countDocument').html(Number($('#countDocument').text()) + res.count);
            if ($('#countDocument').text() < res.totalCount)
                $('#load_more').addClass('d-block').removeClass('d-none');
            else $('#load_more').removeClass('d-block').addClass('d-none');

            $(button).html('Load more');
            $(button).removeClass('disabled');

        }, error: function (err) {
            $(button).html('Load more');
            $(button).removeClass('disabled');
            console.log(err);
        }
    });
});

// Add Property button 
$(document).on('click', 'button[data-target="#add"]', function (e) {
    const id = $(this).attr('data-target');
    $(id).find('input').val('');
});

// Modify property button
$(document).on('click', 'button[data-target="#modify"]', function (e) {
    const id = $(this).attr('data-target');
    const oldName = $(this).attr('data-name');

    $(id).find('#name').html(oldName);
    $(id).find('.btn-save').attr('data-id', $(this).attr('data-id'));
});

// Format number
const formatNumber = function (n) {
    return String(n).replace(/(.)(?=(\d{3})+$)/g, '$1,')
}

// Search website
$(document).on('submit', '.form_search_website', function (e) {
    $('table tbody').html('<tr><td colspan="4" style="padding: 100px 0"><div class="center"><div class="sbl-circ"></div></div></td></tr>');
    $('#totalCountDocument').html('');
    $('#countDocument').html('');

    const input_name = ['name', 'author', 'numOfCols', 'country', 'color', 'trend', 'field', 'minPrice', 'maxPrice'];
    let url = '/admin/websites?';
    input_name.forEach((input, id) => {
        const value = $('.form_search_website input[name="' + input + '"]').val();
        if (value && id == 0) url = url + input + '=' + value;
        else if (value) url += '&' + input + '=' + value;
    });
    if ($('#load_more_web-news button').length) $('#load_more_web-news button').attr('data-url', url);

    $.ajax({
        url: url,
        success: function (res) {
            $('table tbody').html('');
            res.data.forEach(web => {
                $('table tbody').append(`
                    <tr id="${web._id}">
                        <td class="text-center">
                            <div class="widget-content px-1 py-0">
                                <input type="checkbox" class="" data-id="${web._id}" />
                            </div>
                        </td>
                        <td>
                            <div class="widget-content p-0">
                                <div class="widget-content-wrapper">
                                    <div class="widget-content-left flex2">
                                        <div class="widget-heading">${web.name}</div>
                                        <div class="widget-subheading opacity-7">${web.author}</div>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td class="text-center">${formatNumber(web.price)} đ</td>
                        <td class="text-center">
                            <a href='/admin/websites/modify/${web._id}' type="button" id="PopoverCustomT-1" class="btn btn-primary btn-sm">Modify</a>
                        </td>
                    </tr>
                `)
            });
            $('#totalCountDocument').html(res.totalCount);
            $('#countDocument').html(res.count);
            if ($('#load_more_web-news').length) {
                if (res.count < res.totalCount) $('#load_more_web-news').addClass('d-block').removeClass('d-none');
                else $('#load_more_web-news').removeClass('d-block').addClass('d-none');
            }
        }, error: function (err) {
            $('table tbody').html('<tr><td colspan="4" style="padding: 100px 0"><p class="m-0 w-100 text-center font-weight-bold">Error</p></td></tr>');
            console.log(err);
        }
    })
    return false;
});

// Loadmore website / news
$(document).on('click', '#load_more_web-news > button', function (e) {
    const button = this;
    const skip = $('table tbody > tr').length;
    const url = $(this).attr('data-url') + '&skip=' + skip;
    const type = $(this).attr('data-type');

    $.ajax({
        url: url,
        success: function (res) {
            if (type === 'websites') {
                res.data.forEach(web => {
                    $('table tbody').append(`
                        <tr id="${web._id}">
                            <td class="text-center">
                                <div class="widget-content px-1 py-0">
                                    <input type="checkbox" class="" data-id="${web._id}" />
                                </div>
                            </td>
                            <td>
                                <div class="widget-content p-0">
                                    <div class="widget-content-wrapper">
                                        <div class="widget-content-left flex2">
                                            <div class="widget-heading">${web.name}</div>
                                            <div class="widget-subheading opacity-7">${web.author}</div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="text-center">${formatNumber(web.price)} đ</td>
                            <td class="text-center">
                                <a href='/admin/websites/modify/${web._id}' type="button" id="PopoverCustomT-1" class="btn btn-primary btn-sm">Modify</a>
                            </td>
                        </tr>
                    `)
                });
            } else if (type === 'news') {
                res.data.forEach(new_instance => {
                    $('table tbody').append(`
                        <tr id="${new_instance._id}">
                            <td class="text-center">
                                <div class="widget-content px-1 py-0">
                                    <input type="checkbox" class="" data-id="${new_instance._id}" />
                                </div>
                            </td>
                            <td>
                                <div class="widget-content p-0">
                                    <div class="widget-content-wrapper">
                                        <div class="widget-content-left flex2">
                                            <div class="widget-heading">${new_instance.title}</div>
                                            <div class="widget-subheading opacity-7">${new_instance.author}</div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="text-center">${new_instance.points}</td>
                            <td class="text-center">
                                <a href='/admin/news/modify/${new_instance._id}' type="button" id="PopoverCustomT-1" class="btn btn-primary btn-sm">Modify</a>
                            </td>
                        </tr>
                    `);
                })
            }

            $('#countDocument').html(Number($('#countDocument').text()) + res.count);
            if ($('#countDocument').text() < res.totalCount)
                $('#load_more_web-news').addClass('d-block').removeClass('d-none');
            else $('#load_more_web-news').removeClass('d-block').addClass('d-none');

            $(button).html('Load more');
            $(button).removeClass('disabled');

        }, error: function (err) {
            $(button).html('Load more');
            $(button).removeClass('disabled');
            console.log(err);
        }
    })

    $(this).html('Loading...');
    $(this).addClass('disabled');
});

// Search news
$(document).on('submit', '.form_search_news', function (e) {
    $('table tbody').html('<tr><td colspan="4" style="padding: 100px 0"><div class="center"><div class="sbl-circ"></div></div></td></tr>');
    $('#totalCountDocument').html('');
    $('#countDocument').html('');

    const input_name = ['name', 'author', 'tags', 'keywords', 'minPoint', 'maxPoint'];
    let url = '/admin/news?';
    input_name.forEach((input, id) => {
        const value = $('.form_search_news input[name="' + input + '"]').val();
        if (value && id == 0) url = url + input + '=' + value;
        else if (value) url += '&' + input + '=' + value;
    });
    if ($('#load_more_web-news button').length) $('#load_more_web-news button').attr('data-url', url);

    $.ajax({
        url: url,
        success: function (res) {

        }, error: function (err) {

        }
    })

    return false;
})

if (window.Bloodhound) {
    $('#keywords').tagsinput({
        trimValue: true,
    });

    $('#tags').tagsinput({
        trimValue: true,
        typeaheadjs: [{ highlight: true }, {
            name: 'tags',
            displayKey: 'name',
            valueKey: 'name',
            source: function (query, syncResults, asyncResults) {
                $.get('/admin/get-all-tags?query=' + query, function (data) {
                    asyncResults(data);
                });
            }
        }]
    });
}


$('#avatar').change(function () {
    var reader = new FileReader();
    reader.onload = function (e) {
        $('.avatar-preview').removeClass('d-none');
        $('.avatar-preview img').attr('src', e.target.result);
    };
    reader.readAsDataURL(this.files[0]);
});

$('#images').change(function () {
    var countFiles = $(this)[0].files.length;
    $('.images-preview').removeClass('d-none');
    $('.images-preview').html('');

    for (var i = 0; i < countFiles; i++) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $('.images-preview').append(`
                <div class="col-md-4">
                    <img src="${e.target.result}" class="img-thumbnail" alt="Preview images index ${i}" />
                </div>
            `);
        }
        reader.readAsDataURL($(this)[0].files[i]);
    }
});