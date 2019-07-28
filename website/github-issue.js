const GITHUB_REPO_URL_BASE = 'https://github.com/WChrisK/Helion/issues/';

const TIME_INDEX_TO_TEXT = [
    'N/A',
    '<15 min',
    '15-30 min',
    '30-60 min',
    '1-2 hours',
    '2-4 hours',
    '4-8 hours',
    '1 day',
    '2-3 days',
    '4-7 days',
    '1+ weeks',
];

function extractDifficultyFromIssue(issue) {
    let difficulty = 0;

    issue.labels.forEach(function(label) {
        if (label['name'].startsWith('Difficulty: ')) {
            difficulty = parseInt(label['name'].slice(12));
        }
    });

    return difficulty;
}

function extractTimeFromIssue(issue) {
    let time = 0;

    issue.labels.forEach(function(label) {
        if (label['name'].startsWith('Time: ')) {
            time = parseInt(label['name'].slice(6));
        }
    });

    return TIME_INDEX_TO_TEXT[time];
}

function extractAreasFromIssue(issue) {
    let areas = [];

    issue.labels.forEach(function(label) {
        let area = {name: null, color: null};

        if (label['name'].startsWith('Area: ')) {
            area.name = label['name'].slice(6);
        }

        if (label['color']) {
            area.color = label['color'];
        }

        if (area.name !== null && area.color !== null)
            areas.push(area);
    });

    return areas;
}

function findAvailableIssues() {
    let allIssues = {};
    let availableIssues = [];
    let unavailableIssues = [];
    let issues = issueData['issues'];

    Object.keys(issues).forEach(function(issueId) {
        let issue = issues[issueId];

        if (issue.closed) {
            return;
        }

        let dependencyList = [];
        issue.depends.forEach(function(dependencyIssueId) {
            if (!issueData['issues'][dependencyIssueId].closed) {
                dependencyList.push(dependencyIssueId);
            }
        });

        let hasDependency = dependencyList.length > 0;
        let issueObj = {
            id: issueId,
            title: issue.title,
            areas: extractAreasFromIssue(issue),
            difficulty: extractDifficultyFromIssue(issue),
            time: extractTimeFromIssue(issue),
            dependencies: dependencyList
        };

        allIssues[issueId] = issueObj;
        if (hasDependency) {
            unavailableIssues.push(issueObj);
        } else {
            availableIssues.push(issueObj);
        }
    });

    return {
        'all': allIssues,
        'available': availableIssues,
        'unavailable': unavailableIssues
    };
}

function createAreaCell(issue, isDependency) {
    let dataArea = document.createElement('td');
    if (!isDependency) {
        let areaNames = [];
        let areaColors = [];
        issue.areas.forEach(function(data) {
            areaNames.push(data.name);
            areaColors.push(data.color);
        });

        dataArea.innerText = areaNames.join(', ');
        dataArea.style.backgroundColor = '#' + areaColors[0];
    }

    return dataArea;
}

function createRow(issue, tableElement, isDependency) {
    let dataId = document.createElement('td');
    if (!isDependency) {
        dataId.innerText = issue.id;
    }

    let dataTitle = document.createElement('td');
    if (isDependency) {
        dataTitle.style.paddingLeft = '60px';
    }
    let dataTitleLink = document.createElement('a');
    dataTitleLink.innerText = issue.title;
    dataTitleLink.setAttribute('href', GITHUB_REPO_URL_BASE + issue.id);
    dataTitle.appendChild(dataTitleLink);

    let dataArea = createAreaCell(issue, isDependency);

    let dataDifficulty = document.createElement('td');
    if (!isDependency) {
        dataDifficulty.innerText = issue.difficulty + ' / 10';
    }

    let dataTime = document.createElement('td');
    if (!isDependency) {
        dataTime.innerText = issue.time;
    }

    let tableRowTitle = document.createElement('tr');
    tableRowTitle.appendChild(dataId);
    tableRowTitle.appendChild(dataTitle);
    tableRowTitle.appendChild(dataArea);
    tableRowTitle.appendChild(dataDifficulty);
    tableRowTitle.appendChild(dataTime);

    if (isDependency) {
        tableRowTitle.className += ' table-secondary';
    }

    tableElement.appendChild(tableRowTitle);
}

function addIssuesToTable(issueList, allIssues, tableId) {
    let tableElement = document.getElementById(tableId);

    issueList.forEach(function(issue) {
        createRow(issue, tableElement, false);

        issue.dependencies.forEach(function(id) {
            let dependencyIssue = allIssues[id];
            createRow(dependencyIssue, tableElement, true);
        });
    });
}

function populateIssueData() {
    let issuePartitions = findAvailableIssues();
    addIssuesToTable(issuePartitions['available'], issuePartitions['all'], 'available-issue-table');
    addIssuesToTable(issuePartitions['unavailable'], issuePartitions['all'], 'unavailable-issue-table');
}
