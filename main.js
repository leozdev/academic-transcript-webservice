$(document).ready(function () {
  const urlApi = "https://ifsp.ddns.net/webservices/boletim/";
  const ctx = document.getElementById('graficoPizza').getContext('2d');
  let graficoPizza; // Declara o gráfico fora das funções para acesso global

  carregarTodosAlunos();

  $("#mostrarTodos").click(function () {
    carregarTodosAlunos();
  });

  $("#mostrarReprovados").click(function () {
    filtrarAlunos("reprovado");
  });

  $("#mostrarAprovados").click(function () {
    filtrarAlunos("aprovado");
  });

  $("#mostrarRecuperacao").click(function () {
    filtrarAlunos("recuperação");
  });

  $("#botaoBusca").on("click", function () {
    const idAluno = $("#campoBusca").val().trim();
    
    if (idAluno === "") {
      alert("Por favor, insira um ID para buscar.");
      return;
    }

    if (idAluno < 1) {
      alert("ID inválido. O ID deve ser maior ou igual a 1.");
      $("#campoBusca").val("");
      return;
    }

    $.ajax({
      url: urlApi + `aluno/${idAluno}`,
      method: "GET",
      success: function (aluno) {
        renderizarTabela([aluno]);
      },
      error: function () {
        alert("ID não encontrado.");
      },
      complete: function() {
        $("#campoBusca").val("");
      }
    });
  });

  function carregarTodosAlunos() {
    $.ajax({
      url: urlApi + "alunos",
      method: "GET",
      success: function (dados) {
        if (dados.length === 0) {
          alert("Nenhum aluno cadastrado encontrado.");
          return;
        }
        renderizarTabela(dados);
        atualizarGrafico(dados);
      },
      error: function () {
        alert("Erro ao carregar os dados. Tente novamente.");
      }
    });
  }

  function filtrarAlunos(status) {
    $.ajax({
      url: urlApi + "alunos",
      method: "GET",
      success: function (dados) {
        const alunosFiltrados = dados.filter(
          (item) => item.status.toLowerCase() === status.toLowerCase()
        );

        if (alunosFiltrados.length === 0) {
          alert(`Nenhum aluno encontrado com a situação: ${status}.`);
          return;
        }

        renderizarTabela(alunosFiltrados);
      },
      error: function () {
        alert("Erro ao buscar os dados. Tente novamente.");
      }
    });
  }

  $("#formularioCadastro").submit(function (event) {
    event.preventDefault();

    const novoAluno = {
      nome: $("#nome").val().trim(),
      nota1: parseFloat($("#nota1").val()),
      nota2: parseFloat($("#nota2").val()),
      nota3: parseFloat($("#nota3").val()),
    };

    $.ajax({
      url: urlApi + "aluno",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(novoAluno),
      success: function () {
        carregarTodosAlunos();
        $("#formularioCadastro")[0].reset();
      },
      error: function () {
        alert("Erro ao cadastrar o aluno.");
      }
    });
  });

  $(document).on("click", ".btn_excluir", function () {
    const idAluno = $(this).data("id");
    if (confirm("Tem certeza que deseja excluir este aluno?")) {
      $.ajax({
        url: urlApi + `aluno/${idAluno}`,
        method: "DELETE",
        success: function () {
          carregarTodosAlunos();
        },
        error: function () {
          alert("Erro ao excluir o aluno. Tente novamente.");
        }
      });
    }
  });

  function renderizarTabela(dados) {
    const corpoTabela = $("#tabelaResultados tbody");
    corpoTabela.empty();
  
    dados.forEach((item) => {
      corpoTabela.append(`
        <tr>
          <td>${item.id}</td>
          <td>${item.nome}</td>
          <td>${item.nota1.toFixed(2)}</td>
          <td>${item.nota2.toFixed(2)}</td>
          <td>${item.nota3.toFixed(2)}</td>
          <td>${item.media.toFixed(2)}</td>
          <td>${item.status}</td>
          <td><button class="btn_excluir" data-id="${item.id}"><i class="fas fa-trash"></i></button></td>
        </tr>
      `);
    });
  }

  function atualizarGrafico(dados) {
    const aprovados = dados.filter(item => item.status.toLowerCase() === "aprovado").length;
    const reprovados = dados.filter(item => item.status.toLowerCase() === "reprovado").length;
    const recuperacao = dados.filter(item => item.status.toLowerCase() === "recuperação").length;

    const newData = [aprovados, reprovados, recuperacao];

    if (graficoPizza) {
        graficoPizza.data.datasets[0].data = newData;
        graficoPizza.update();
    } else {
        graficoPizza = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Aprovados', 'Reprovados', 'Em Recuperação'],
                datasets: [{
                    label: 'Quantidade de Alunos',
                    data: newData,
                    backgroundColor: ['#4caf50', '#f44336', '#ff9800'],
                    borderColor: ['#ffffff', '#ffffff', '#ffffff'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                  legend: {
                      position: 'bottom',
                      align: 'center',
                      labels: {
                          color: '#ffffff',
                          font: {
                              size: 14,
                              family: 'Montserrat',
                              weight: '600'
                          },
                          boxWidth: 20,
                          boxHeight: 10,
                          usePointStyle: true,
                          padding: 20
                      },
                      display: true,
                      fullSize: false
                  }
              }
            }
        });
    }
  }
});