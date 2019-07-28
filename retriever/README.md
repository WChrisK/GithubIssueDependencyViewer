# Github issue tracker

### Requires
```bash
pip install PyGithub
```

### Setup

Create `auth.txt` in your working directory and put *only* your github token inside of it (no spaces, no new lines, ...etc).

### Running
```bash
python main.py <repoName> [outputJsonPath]
```

Example: `python main.py "MyName/MyRepo"`

Example: `python main.py "MyName/MyRepo" "/home/user/issues.json"`

You will now have `issues.json` (or whatever you called it if you provided a 2nd argument) with all the data that can be loaded by any application!