$(document).ready(function () {

    //Jquery ui config
    $("#media-dialog").dialog({
        autoOpen: false,
        show: {
            effect: "blind",
            duration: 200
        },
        position: { my: "center", at: "top" },
        hide: {
            effect: "explode",
            duration: 200
        },
        title: 'Danh sách các media',
        modal: true,
        buttons: {
            'Đóng': function () {
                $(this).dialog("close");
            }
        },
        close: function (event, ui) {

            $('#image-group').empty();
            $('#video-group').empty();

        },
        open: function (event, ui) {
            $('.ui-widget-overlay').bind('click', function () {
                $("#media-dialog").dialog('close');
            });
        },
        width: "90%"
    });
    //-----------------------------------------

    var imageList = [];
    var videoList = [];
    var mediaList = [];
    var selectedCoordinate = null;
    var selectedLocation = null;
    var isLoading = false;

    function pre(searchType) {

        $("#loading").show();
        isLoading = true;
        $("#coordinateNotFound").hide();
        imageList = [];
        videoList = [];
        mediaList = [];
        $("#media-group").empty();
        switch (searchType) {
            case 'coordinate':
                selectedCoordinate = null;
                selectedLocation = null;
                $("#locationFound").hide();
                $("#coordinateFound").hide();
                $("#coordinateGroup").empty();
                $("#locationGroup").empty();
                break;
            case 'location':
                selectedLocation = null;
                $("#locationFound").hide();
                $("#locationGroup").empty();
                break;

        }

    }

    function getAjaxObject(searchType) {

        let url = null;
        let query = null;

        switch (searchType) {

            case 'coordinate':
                url = geocodingUrl;
                query = {

                    address: $("#location").val(),
                    key: ggAPIKey

                }
                $("#location").val('');

                break;

            case 'location':

                console.log(selectedCoordinate);
                if (!selectedCoordinate)
                    return null;
                url = instagramLocationUrl;
                query = {

                    lat: selectedCoordinate.lat,
                    lng: selectedCoordinate.lng,
                    access_token: instagramAPIKey

                }
                break;

            case 'media':
                console.log(selectedLocation);
                if (!selectedLocation)
                    return null;
                url = instagramMediaUrl;
                query = {

                    lat: selectedLocation.lat,
                    lng: selectedLocation.lng,
                    access_token: instagramAPIKey

                }
                break;
            default:
                return null;

        }

        return {

            url: url,
            data: query,
            type: "GET"

        }

    }

    function search(searchType) {

        if (isLoading)
            return;
        pre(searchType);
        let ajaxObject = getAjaxObject(searchType);
        if (!ajaxObject)
            return;
        $.when($.ajax(ajaxObject)).then(function (data, textStatus, jqXHR) {
            console.log(textStatus);
            console.log(jqXHR);
            console.log(data);
            isLoading = false;
            $("#loading").hide();
            process(searchType, data);
        }, function (jqXHR, error) {

            console.log(jqXHR);
            console.log(error);
            isLoading = false;
            $("#loading").hide();
            alert('Có lỗi xảy ra, vui lòng thử lại sau');

        });

    }

    function process(searchType, data) {

        switch (searchType) {
            case 'coordinate':
                if (data.results.length > 0) {

                    $("#coordinateFound").show();
                    data.results.forEach(coordinate => {

                        let address = coordinate.formatted_address;
                        let lat = coordinate.geometry.location.lat;
                        let lng = coordinate.geometry.location.lng;
                        let coordinateItem = document.createElement("tr");
                        coordinateItem.dataset.address = address;
                        coordinateItem.dataset.lat = lat;
                        coordinateItem.dataset.lng = lng;
                        coordinateItem.innerHTML = `
                        <td>${address}</td>
                        <td>${lng}</td>
                        <td>${lat}</td> `;
                        $("#coordinateGroup").append(coordinateItem);

                    })

                    $("#coordinateGroup tr").click(function () {

                        selectedCoordinate = $(this).data();
                        console.log(selectedCoordinate);
                        search("location");

                    })

                } else
                    $("#coordinateNotFound").show();
                break;
            case 'location':
                if (data.data.length > 0) {

                    $("#locationFound").show();
                    $("#selectedCoordinateName").text(selectedCoordinate.address);
                    data.data.forEach(location => {

                        let locationItem = document.createElement("tr");
                        locationItem.dataset.id = location.id;
                        locationItem.dataset.lat = location.latitude;
                        locationItem.dataset.lng = location.longitude;
                        locationItem.innerHTML = `
                                        <td>${location.name}</td>
                                        <td>${location.longitude}</td>
                                        <td>${location.latitude}</td> `;
                        $("#locationGroup").append(locationItem);

                    })

                    $("#locationGroup tr").click(function () {

                        selectedLocation = $(this).data();
                        search("media");

                    })

                }
                break;
            case 'media':
                if (data.data.length > 0) {

                    data.data.forEach(item => {

                        let mediaObject = {

                            link: item.link,
                            time: new Date(Number(item.created_time) * 1000).toLocaleString(),
                            caption: item.caption ? item.caption.text : null,
                            commentCount: item.comments.count,
                            likeCount: item.likes.count,
                            image: item.images.standard_resolution.url,
                            location: item.location ? item.location.name : undefined,
                            user: item.user,
                            video: item.type === 'video' ? item.videos.standard_resolution.url : undefined

                        }

                        mediaList.push(mediaObject);


                    })

                    mediaList.forEach(item => {

                        let caption = `
                        <p>
                            <i>Posted on ${item.time}</i>
                        </p>`;
                        if (item.location)
                            caption += `<p><span class="glyphicon glyphicon-map-marker"></span> <b>${item.location}</b></p>`;
                        if (item.caption)
                            caption += `<p>${item.caption}</p>`;
                        caption += `
                        <div class="text-right">
                            <span title="likes">${item.likeCount} <i class="fa fa-thumbs-up" style="color: blue" aria-hidden="true"></i></span>
                            <span title="comments">${item.commentCount} <i class="fa fa-comment" aria-hidden="true"></i></span>
                        </div>
                        `
                        let mediaHtml = item.video ?
                            `<video src="${item.video}" alt="video" poster="${item.image}" style="width:100%" controls></video>` :
                            `<img src="${item.image}" alt="image" style="width:100%">`;
                        let html = `
                        <div class="col-sm-8 col-sm-offset-2 col-xs-12">
                            <div class="thumbnail" style="padding: 10px">
                                <div class="media">
                                    <div class="media-left">
                                        <img src="${item.user.profile_picture}" class="media-object" style="width:100px">
                                    </div>
                                    <div class="media-body" style="color: black">
                                        <h4 class="media-heading" style="font-size: 22px"><b>${item.user.full_name}</b></h4>
                                        <p>@${item.user.username}</p>
                                        <a href="${item.link}" target="_blank" style="color: #00B7FF">${item.link}</a>
                                    </div>
                                </div>
                                <br>
                                <a href="${item.link}" target="_blank">
                                    ${mediaHtml}
                                    <div class="caption">
                                        ${caption}
                                    </div>
                                </a>
                            </div>
                        </div>`;

                        $("#media-group").append(html);

                    })

                    $("#media-dialog").dialog("open");

                }

                break;
        }

    }

    $("#locationSearchForm").submit(function (event) {

        event.preventDefault();
        search('coordinate');

    })



});