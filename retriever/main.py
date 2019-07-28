# =============================================================================
# Information:
# -----------------------------------------------------------------------------
# We can find a list of the supported issue fields here:
# https://developer.github.com/v3/issues/#list-issues
# =============================================================================

from github import Github
import json
import os
import re
import sys

_AUTH_FILE = 'auth.txt'
_OUTPUT_ISSUES_FILE_DEFAULT = 'issues.json'


class Issue:
    def __init__(self, issue, repo):
        self._issue = issue
        self.number = issue.number
        self.title = issue.title
        self.is_assigned = len(issue.assignees) > 0
        self.is_closed = issue.state.lower() == 'closed'
        self.depends_on = Issue._find_dependencies(issue, repo)
        self.labels = Issue._find_labels(issue)

    @staticmethod
    def _find_dependencies(issue, repo):
        dependencies = dict()
        matches = re.findall(r'Depends on #(\d+)', issue.body, re.IGNORECASE)
        for issue_number_str in matches:
            issue_number = int(issue_number_str)
            dependencies[issue_number] = repo.get_issue(issue_number)
        return dependencies

    @staticmethod
    def _find_labels(issue):
        labels = []
        for label in issue.labels:
            labels.append({'name': label.name, 'color': label.color})
        return labels


class IssueReader:
    def __init__(self, token, repo_name):
        self.github = Github(token)
        self.repo = self.github.get_repo(repo_name)
        self.issues = dict()
        for issue in self.repo.get_issues(state='all'):
            self.issues[issue.number] = Issue(issue, self.repo)

    def print_to_file(self, output_file_path):
        issues = dict()
        for issue_number, issue in self.issues.items():
            issues[issue_number] = {
                'title': issue.title,
                'closed': issue.is_closed,
                'assigned': issue.is_assigned,
                'labels': issue.labels,
                'depends': list(issue.depends_on)
            }
        data = {'issues': issues}
        with open(output_file_path, 'w') as f:
            json.dump(data, f, ensure_ascii=True, indent=4, separators=(',', ': '), sort_keys=True)


def read_token():
    if not os.path.exists(_AUTH_FILE):
        print('Could not find', _AUTH_FILE, 'to read github token from')
        sys.exit(1)
    with open(_AUTH_FILE) as f:
        token = f.readlines()[0].strip()
        if len(token) == 0:
            print('No token found in', _AUTH_FILE)
            sys.exit(1)
        return token


if __name__ == '__main__':
    if len(sys.argv) <= 1:
        print('Expected runtime argument of the repo name (ex: "OwnerName/RepoName")')
        sys.exit(1)
    output_file = sys.argv[2] if len(sys.argv) >= 3 else _OUTPUT_ISSUES_FILE_DEFAULT
    issue_reader = IssueReader(read_token(), sys.argv[1])
    issue_reader.print_to_file(output_file)
