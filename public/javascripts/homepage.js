document.addEventListener('DOMContentLoaded', () => {
    console.log('hi')
    let categoriesBtn = document.querySelector('header #header-mid #categories-btn')
    let filterDropdowns = document.querySelectorAll('.products-row>.filter-row>.filter-dropdown')
    let filterRow = document.querySelector('.products-row > .filter-row')
    let sidebar = document.querySelector('#main-menu.sidebar')
    let sidebarCloseBtn = document.querySelector('#main-menu.sidebar #close-btn')
    let sidebarCategories = document.querySelectorAll('#main-menu.sidebar .category');


    console.log(sidebarCloseBtn)
    filterDropdowns.forEach((e, index) => {
        let dropdown = e.querySelector('.dropdown')
        
        dropdown.style.left = `${-e.offsetLeft + 3 * Math.floor(index % 5)}px`
        e.addEventListener('mouseenter', function (event) {
            dropdown.style.width = `${filterRow.offsetWidth}px`;
        })

        
    })

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
})