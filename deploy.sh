# sudo docker stop sudoku-solver-back &&
# sudo docker rm sudoku-solver-back &&
sudo docker image build -t sudoku-solver-back . &&
sudo docker container run --name sudoku-solver-back -d -p 8005:8080 sudoku-solver-back