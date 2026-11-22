DEV notes
---
## general suggestions
I suggest using the same virtual python environment. I have not included my python venv (large size). run the requrements.txt file as note that I have used *Python 3.15.2*. make sure to use the same version so we are in the same page.

if you are using pip run the following command to add the requirements to the venv, otherwise, just open the [requirements.txt](/requirements.txt) and accept the prompt to install the packages.
```python
pip install requirements.txt
```
to install the python packages ive installed for my work.(required for my section of work). if you intend to install more packages for your work, do so with pip and update the requrements.txt file by running
```python
pip freeze -> requirements.txt
```
if your editor suggests you to update package versions (pandas) do not do so because my code expects pandas 3.10. update your dependencies if only you are sure that updates will not break your code.

If there are files that you wish not to add to the git tracking list, include it in the .gitignore file.
## README.md
I will maintain the readme file. do not add anything to the main project readme. instead explain your work or leave any other notes in 'notebooks' folder as a md file.
