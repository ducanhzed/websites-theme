document.addEventListener('DOMContentLoaded', () => {
    console.log('hi')
    let categoriesBtn = document.querySelector('header #header-mid #categories-btn')
    let sidebar = document.querySelector('#main-menu.sidebar')
    let sidebarCloseBtn = document.querySelector('#main-menu.sidebar #close-btn')
    let sidebarCategories = document.querySelectorAll('#main-menu.sidebar .category');
    let formSelections = document.querySelectorAll('.form-container > #filter-form select');
    let formInputs = document.querySelectorAll('.form-container > #filter-form input')
    const submitBtn = document.querySelector('.form-container > .submit > button')
    //sidebar
    sidebarCategories.forEach(e => {
        e.querySelector('.title').addEventListener('click', () => {
            //show dropdown
            if (e.classList.contains('dropped')) {
                e.classList.remove('dropped')
            }
            else {
                sidebarCategories.forEach(cate => {
                    cate.classList.remove('dropped')
                })
                e.classList.add('dropped')
            }
        })
    })
    document.querySelector('body .overlay').addEventListener('click', () => {
        sidebar.classList.remove('expand')
    })
    categoriesBtn.addEventListener('click', () => {
        sidebar.classList.add('expand')
    })

    sidebarCloseBtn.addEventListener('click', () => {
        console.log('fffffff')
        sidebar.classList.remove('expand')
    })


    //pagination 
    const currLink = window.location.href
    const regexPageNumber = /\WpageNumber=\d+/i
    const paginationArr = document.querySelectorAll('.pagination > .pages a.page')

    function addActiveToPagination() {

        //choose what to show
        const regexToGetPageNumber = currLink.match(regexPageNumber)
        let number = (regexToGetPageNumber) ? parseInt(regexToGetPageNumber[0].replace(/\WpageNumber=/, '')) : 1;
        //console.log(paginationArr)
        paginationArr[number - 1].classList.add('active');
        paginationArr[number - 1].classList.remove('hide');
        const number2 = (number - 2 < 0) ? number + 1 : number - 2;
        const number3 = (number < paginationArr.length) ? number : (number - 3);

        paginationArr[number2].classList.remove('hide');
        paginationArr[number3].classList.remove('hide');
    }

    paginationArr.forEach(e => {
        e.addEventListener('click', function (e) {
            let newLink = currLink.replace(regexPageNumber, '');
            console.log((newLink.match(/\?./)))
            newLink += (newLink.match(/\?./)) ? `&pageNumber=${this.dataset.pagenumber}` : `\?pageNumber=${this.dataset.pagenumber}`
            newLink.replace(/\?\?/, '?');
            console.log(newLink)
            window.location.href = newLink
        }, { once: true })
    })

    submitBtn.addEventListener('click', function (e) {
        let newLink = currLink.replace(/\?.+/g, '');

        e.preventDefault();
        formInputs.forEach((elem, index) => {
            const added = ((index == 0) ? 'lowPrice=' : 'highPrice=') + elem.value
            if (elem.value)
                newLink += (newLink.match(/\?./)) ? `&${added}` : `\?${added}`
        })

        formSelections.forEach(elem => {
                if (elem.value)
                newLink += (newLink.match(/\?./)) ? `&${elem.value}` : `\?${elem.value}`
        })

        newLink.replace(/\?\?/, '?');
        console.log(newLink)
        window.location.href = newLink
    }, { once: true })
    addActiveToPagination()
})