const GITHUB_REPO_URL_BASE = 'https://github.com/WChrisK/Helion/issues/';

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
        let issueObj = {id: issueId, title: issue.title, dependencies: dependencyList};

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

function createRow(issue, tableElement) {
    let dataId = document.createElement('td');
    dataId.innerText = issue.id;

    let dataTitle = document.createElement('td');
    let dataTitleLink = document.createElement('a');
    dataTitleLink.innerText = issue.title;
    dataTitleLink.setAttribute('href', GITHUB_REPO_URL_BASE + issue.id);
    dataTitle.appendChild(dataTitleLink);

    let dataArea = document.createElement('td');
    dataArea.innerText = 'area';

    let dataDifficulty = document.createElement('td');
    dataDifficulty.innerText = 'difficulty';

    let dataTime = document.createElement('td');
    dataTime.innerText = 'time';

    let tableRowTitle = document.createElement('tr');
    tableRowTitle.appendChild(dataId);
    tableRowTitle.appendChild(dataTitle);
    tableRowTitle.appendChild(dataArea);
    tableRowTitle.appendChild(dataDifficulty);
    tableRowTitle.appendChild(dataTime);

    tableElement.appendChild(tableRowTitle);
}

function addIssuesToTable(issueList, allIssues, tableId) {
    let tableElement = document.getElementById(tableId);

    issueList.forEach(function(issue) {
        createRow(issue, tableElement);

        issue.dependencies.forEach(function(id) {
            // // TODO: Add indented link
            // let tableDependencyTitle = document.createElement('td');
            // tableDataTitle.innerText = ' DEPENDS ON: ' + issue.title;
            //
            // let tableDependencyRow = document.createElement('tr');
            // tableDependencyRow.appendChild(tableDependencyTitle);
            //
            // tableElement.appendChild(tableDependencyRow);
        });
    });
}

function populateIssueData() {
    let issuePartitions = findAvailableIssues();
    addIssuesToTable(issuePartitions['available'], issuePartitions['all'], 'available-issue-table');
    addIssuesToTable(issuePartitions['unavailable'], issuePartitions['all'], 'unavailable-issue-table');
}
