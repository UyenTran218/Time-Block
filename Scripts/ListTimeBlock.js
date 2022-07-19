

const importExportDiv = $('#importExportDiv');
const doneCancelDiv = $('#doneCancelDiv');
const hiddenField = $('#checkBoxIdString');
const listControlButtons = $('#listControlButtons');
const scrollTable = $('.scroll-table');

let listTimeBlocksFlipped = false;
let currentBlockRow = -1;

let importOptions = {
    url: '/TimeBlocks/ImportTimeBlocks',
    type: 'POST',
    dataType: 'json',

    target: '.time-block-list-table',
    beforeSubmit: null,
    success: function (data) {
        $('#importExportForm')[0].reset();
        showResults(data['Results']);
        importIntoList(data['TimeBlocks']);
    }
};

let exportOptions = {
    url: '/TimeBlocks/ExportTimeBlocks',
    type: 'POST',

    target: null,
    beforeSubmit: null,
    success: saveExportList
};

$('document').ready(init());

function init() {

    $('#importExportForm').ajaxForm().submit(function (id) {

        let options = event.target.id == "doneButton" ? exportOptions : importOptions;
        $(this).ajaxSubmit(options);

        return false;
    });

    $('#newBlockForm').ajaxForm().submit(function (id) {
        options = {
            url: '/TimeBlocks/CreateTimeBlock',
            type: 'POST',
            target: null,
            beforeSubmit: null,
            success: importIntoList
        };
        $(this).ajaxSubmit(options);

        return false;
    });

    $('.time-block-list-table tbody>tr').click(function () {
        tableClickRow(this);
    });

    $('#select-all-chkbox').change(function () {
        $('.selected').removeClass('selected');
        hiddenField.val('');
        $('.time-block-list-table tbody>tr').click();
    });

    $('#select-all-label').tooltip({
        title: 'Select All',
        placement: 'auto bottom',
        animation: true,
        delay: 300,
        trigger: 'hover'
    });

    $('#doneButton').click(function () {
        if ($('.selected').length == 0) {
            showResults("Please select one or more TimeBlocks");
            return;
        }
        $('#importExportForm').submit();
        flipButtonDiv();
    });

    $('#exportButton, #cancelButton').click(function () {
        if (this.id == 'exportButton' && $('.time-block-list-table tr').length == 0) {
            showResults('No TimeBlocks to export');
            return;
        }
        clearIDHiddenField();
        flipButtonDiv();
    })

    $('#exportLabel, #importLabel, #doneButton, #cancelButton').tooltip({
        title: function () {
            switch (this.id) {
                case 'exportLabel':
                    return 'Export';
                case 'importLabel':
                    return 'Import';
                case 'doneButton':
                    return 'Done';
                case 'cancelButton':
                    return 'Cancel';
            }
        },
        placement: 'auto bottom',
        animation: true,
        delay: 300,
        trigger: 'hover'
    });

    $('.table-data-length').each(function () {
        let td = $(this);
        let string = td.html().split(':');
        string = string[1] + ":" + string[2]
        if (string[0] == '0') {
            string = string.substring(1);
        }
        td.html(string);
    });

    $('#importButton').change(function () {
        $('#importExportForm').submit();
    });

    $('#listButtonTop, #listButtonUp, #listButtonDown, #listButtonBottom').click(function () {

        let rowOne = $('.selected');
        if (rowOne.length != 1) {
            showResults('Please select a row to move')
            return;
        }
        switch (this.id) {
            case 'listButtonTop':
            case 'listButtonUp':
                if (rowOne[0].rowIndex == 0) {
                    return;
                }
                break;
            case 'listButtonDown':
            case 'listButtonBottom':
                if (rowOne[0].rowIndex == $('.time-block-list-table')[0].rows.length - 1) {
                    return;
                }
                break;
            default:
                return;
        }
        let rowPriorityInfo = {
            'ButtonID': this.id,
            'RowIndex': rowOne[0].rowIndex
        };
        $.post('/TimeBlocks/UpdateTimeBlocksPriority', rowPriorityInfo,
            function (data, status) {
                switch (data) {
                    case 'listButtonTop':
                        $('.time-block-list-table').prepend(rowOne);
                        break;
                    case 'listButtonUp':
                        rowOne.insertBefore(rowOne.prev());
                        break;
                    case 'listButtonDown':
                        rowOne.insertAfter(rowOne.next());
                        break;
                    case 'listButtonBottom':
                        $('.time-block-list-table').append(rowOne);
                        break;
                    default:
                        showResults('Unknown Error');
                        break;
                }

            })
    }).tooltip({
        title: function () {
            switch (this.id) {
                case 'listButtonTop':
                    return 'Top';
                case 'listButtonUp':
                    return 'Up';
                case 'listButtonDown':
                    return 'Down';
                case 'listButtonBottom':
                    return 'Bottom';
            }
        },
        placement: 'auto bottom',
        animation: true,
        trigger: 'hover',
        delay: 300
    });

    scrollTable.tooltip({
        title: '',
        placement: 'auto bottom',
        animation: true,
        trigger: 'manual'
    });

    $('#listButtonAdd, #listButtonRemove').click(function () {
        switch (this.id) {
            case 'listButtonAdd':
                $('#cover').fadeIn(800);
                break;

            case 'listButtonRemove':
                var row = $('.selected');
                if (row.length == 0) {
                    showResults("Please select a row to remove.");
                    return;
                } 
                if (confirm('Are you sure you want to delete the selected row?')) {
                    $.post('/TimeBlocks/RemoveTimeBlock', { rowIndex: row[0].rowIndex },
                        function () {
                            $('.selected').slideToggle().remove();
                        });
                }
                break;

        }
    }).tooltip({
        title: function () {
            switch (this.id) {
                case 'listButtonAdd':
                    return 'Create New';
                case 'listButtonRemove':
                    return 'Remove';
            }
        },
        placement: 'auto bottom',
        animation: true,
        trigger: 'hover'
    });

    $('#file-select').change(function () {
        $('#file-string').attr('value', this.value);
    });

    $('[data-toggle="tooltip"]').tooltip();
}

function addNewTimeBlock() {

}

function flipButtonDiv() {
    flipCurrentBlockSelected();
    importExportDiv.fadeToggle(500);
    doneCancelDiv.fadeToggle(500);
    listControlButtons.toggleClass('disabled enabled');
    $('.timeblock-checkbox').prop('checked', false);
    $('.selected').removeClass('selected');
    listTimeBlocksFlipped = !listTimeBlocksFlipped;
}

function flipCurrentBlockSelected() {
    let currentBlock = $('.current-time-block');
    if (currentBlockRow == -1) {
        if (currentBlock.length == 0) {
            return;
        }
        currentBlockRow = currentBlock[0].rowIndex;
    } else {
        currentBlock = $('.time-block-list-table tr:eq(' + currentBlockRow + ')');
        currentBlockRow = -1;
    }
   
    currentBlock.toggleClass('current-time-block');
}

function importIntoList(data) {
    i = 0;
    for (let index in data) {
        let row = `
            <tr class="listTableRow" style="display: none;">
                <td class="table-data-name">` + data[index].Name + `</td>
                <td class="table-data-length">` + data[index].Length.toReadableTime() + `</td>
                <td class="table-data-checkbox"><input type="checkbox" class="timeblock-checkbox collapse" /></td>
            </tr>
        `;
        $('.time-block-list-table tbody').append(row);
        $('.time-block-list-table tr:last').click(function () {
            tableClickRow(this);
        }).delay(i++ * 250).show('slow');
    }  
}

function showResults(data) {
    scrollTable.attr('title', data).tooltip('fixTitle');
    scrollTable.tooltip('show', );
    setTimeout(function () {
        scrollTable.tooltip('hide');
    }, 5000);
}

function saveExportList(filePath) {
    window.open(filePath, 'Download');
}

function tableClickRow(source) {
    let tr = $(source);

    if (!listTimeBlocksFlipped) {
        if (tr.hasClass('selected')) {
            selectCurrentTimeBlock(tr);
            removeIDHiddenField(tr[0].rowIndex);
            $('.selected').removeClass('selected').find('[type=checkbox]').prop('checked', false);
            return;
        }
        $('.selected').removeClass('selected').find('[type=checkbox]').prop('checked', false)
        clearIDHiddenField();
    }
    tr.toggleClass('selected');

    let checkBox = tr.find('[type=checkbox]');
    checkBox.prop('checked', tr.hasClass('selected'));

    let rowIndex = tr[0].rowIndex;

    if (checkBox[0].checked) {
        addIDHiddenField(rowIndex);
    } else {
        removeIDHiddenField(rowIndex);
    }

} 
function clearIDHiddenField() {
    hiddenField.val('');
}

function addIDHiddenField(id) {
    hiddenField.val(hiddenField.val() + (hiddenField.val().length == 0 ? '' : ',') + id);
}
function removeIDHiddenField(id) {
    let result = '';
    let values = hiddenField.val().split(',')
    for (i = 0; i < values.length; i++) {
        if (values[i] != null && values[i] != id) {
            result += ',' + values[i];
        }
    };

    result = result.substring(1);
    hiddenField.val(result);
}


function selectCurrentTimeBlock(tr) {
    let currentBlock = $('.current-time-block');

    if (currentBlock.length > 0 && tr[0].rowIndex == currentBlock[0].rowIndex) {
        return;
    }

    let index = -1;
    if (currentBlock.length > 0) {
        index = currentBlock[0].rowIndex;
    }    

    let arr = $('#time').html().split(':');
    let result = 0;
    let i = 0;
    switch (arr.length) {
        case 3:
            result += parseInt(arr[i++])*3600;
        case 2:
            result += parseInt(arr[i++])*60;
        case 1:
            result += parseInt(arr[i]);
            break;
    }

    let data = {
        'CurrentTime': result,
        'CurrentRow': index,
        'CurrentMediaTime': mediaPlayerGetCurrentTime(),
        'NextRow': tr[0].rowIndex
    }

    currentBlock.toggleClass('current-time-block');
    tr.toggleClass('current-time-block');

    $.ajax({
        url: '/TimeBlocks/UpdateCurrentTimeBlock',
        type: 'POST',
        dataType: 'JSON',
        data: data,
        success: function (result) {
            if (typeof t !== "undefined") {
                clearInterval(t);
                t = null;
            }
            CurrentTimeBlock = result;
            updateMediaPlayer();
            UpdateTimeBlockInformation();
            $('#start').removeClass('disabled');


        }
    });
}

function UpdateTimeBlockInformation() {
    $('#timeName').html(CurrentTimeBlock['Name']);
    $('#time').html((CurrentTimeBlock['Length'] - CurrentTimeBlock['TimeElapsed']).toReadableTime());
}
