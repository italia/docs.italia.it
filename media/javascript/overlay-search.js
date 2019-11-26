/**
 * Overlay search
 * Reference to: https://github.com/italia/docs.italia.it/issues/314
 */

var debounceInputTiming = 300
var minCharacters = 3
var params = {
  filter: 'all',
  search: ''
}

var pendingRequest = null
var fetchResultsFromApi = function () {
  if (pendingRequest) pendingRequest.abort('Canceled from user')

  if (params.search.length < minCharacters) {
    return hideResults()
  }

  pendingRequest = $.ajax({
    url: '/api/v2/search/',
    type: 'GET',
    data: {
      q: params.search,
      kind: params.filter
    }
  })
    .done(function (response) {
      showResults(response.results)
    })
    .fail(function (error) {
      if (error.statusText !== 'Canceled from user') {
        hideResults()
      }
    })
}

var createSearchMoreItemList = function () {
  var link = '/search/?q=' + params.search + '&type=file'
  var title = 'Ricerca libera per "' + params.search + '"'

  return (
    '<li class="autocomplete-list-freesearch">' +
      '<a class="ml-1" href="' + link + '">' +
        '<svg class="icon icon-xs icon-primary search-icon">' +
          '<use xlink:href="/media/static/vendor/bootstrap-italia/svg/sprite.svg#it-search"></use>' +
        '</svg>' +
        '<span class="autocomplete-list-text">' +
          '<span>' + title + '</span>' +
        '</span>' +
        '<svg class="icon icon-xs icon-primary right-arrow-icon">' +
          '<use xlink:href="/media/static/vendor/bootstrap-italia/svg/sprite.svg#it-arrow-right"></use>' +
        '</svg>' +
      '</a>' +
    '</li>'
  )
}

var createItemList = function (item) {
  if (!item) return ''

  var title = item.text.replace('<span>', '<mark>').replace('</span>', '</mark>')
  var link = item.link
  var icon = 'it-file'
  var type = (item.kind || '').toUpperCase()

  if (item.kind === 'documento') icon = 'it-file'
  else if (item.kind === 'progetto') icon = 'it-folder'
  else if (item.kind === 'amministrazione') icon = 'it-pa'

  return (
    '<li>' +
      '<a href="' + link + '">' +
        '<svg class="icon icon-sm">' +
          '<use xlink:href="/media/static/vendor/bootstrap-italia/svg/sprite.svg#' + icon + '"></use>' +
        '</svg>' +
        '<span class="autocomplete-list-text">' +
          title + ' <em>' + type + '</em>' +
        '</span>' +
      '</a>' +
    '</li>'
  )
}

var showResults = function (results) {
  var elementsList = results.map(createItemList)
  elementsList.push(createSearchMoreItemList())
  $('#autocompleteListSearchFullScreen').html(elementsList)
  $('#autocompleteListSearchFullScreen').show()
  $('#autocompleteFilters').hide()
}

var hideResults = function () {
  $('#autocompleteListSearchFullScreen').hide()
  $('#autocompleteFilters').show()
}

$(document).ready(function () {
  var modal = $('#modalSearchFullScreen')
  var input = $('#autocompleteSearchFullScreen')
  var tagButtons = $('.sfs-btn-tag')

  // Options
  // https://getbootstrap.com/docs/4.0/components/modal/#options
  modal.modal({
    backdrop: false,
    show: false
  })

  // Event triggered on open modal click
  modal.on('show.bs.modal', function () {
    $(document).scrollTop(0)
  })

  // Event triggered on open modal animation finished
  modal.on('shown.bs.modal', function () {
    input.focus()
  })

  // Event triggered on close modal click
  modal.on('hide.bs.modal', function () {

  })

  // Event triggered on close modal animation finished
  modal.on('hidden.bs.modal', function () {
    input.val('')
    hideResults()
  })

  input.on('paste keyup', debounce(function () {
    params.search = $(this).val()
    fetchResultsFromApi()
  }, debounceInputTiming))

  var testListener = function (e) {
    if (!$(e.target).parents('.autocomplete-wrapper-big').length) {
      hideResults()
      window.removeEventListener('click', testListener)
    }
  }

  input.on('focus', function () {
    params.search = $(this).val()
    fetchResultsFromApi()
    window.addEventListener('click', testListener)
  })

  tagButtons.on('click', function () {
    var filter = $(this).attr('data-filter')
    params.filter = filter

    tagButtons.each(function (index, button) {
      $(this).removeClass('btn-primary btn-outline-secondary')

      var isActive = $(this).attr('data-filter') === filter
      $(this).addClass(isActive ? 'btn-primary' : 'btn-outline-secondary')

      var icon = button.querySelector('.icon')
      if (icon) icon.setAttribute('class', isActive ? 'icon icon-white' : 'icon icon-secondary')
    })

    // fetchResultsFromApi()
  })
})

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
var debounce = function (func, wait, immediate) {
  var timeout

  return function () {
    var context = this
    var args = arguments

    var later = function () {
      timeout = null
      if (!immediate) func.apply(context, args)
    }

    var callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)

    if (callNow) {
      func.apply(context, args)
    }
  }
}
