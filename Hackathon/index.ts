interface IFeedback {
  id: number;
  name: string;
  score: number;
}

class Feedback implements IFeedback {
  id: number;
  name: string;
  score: number;

  constructor(id: number, name: string, score: number) {
    this.id = id;
    this.name = name;
    this.score = score;
    this.handleAverageRating();
    this.handleScoreButtonClick();
    this.renderFeedback();
    this.renderListButtonScore();
    this.updateFeedback();
    this.deleteFeedback();
    this.renderListFeedback();
  }
  updateFeedback() {
    listFeedbackContent?.addEventListener("click", (e) => {
      if (e.target && (e.target as HTMLElement).matches(".fa-pen-to-square")) {
        const idUpdate: string = (e.target as HTMLElement).id.split("_")[1];
        updatingFeedback = listFeedbackLocal.find(
          (fb) => fb.feedbackId === idUpdate
        );

        if (updatingFeedback) {
          btnSend!.innerHTML='Update'
          // Gán thông tin công việc vào input và active điểm
          feedbackInput!.value = updatingFeedback.content;
          scoreActive = updatingFeedback.score;

          // Render lại danh sách điểm để active điểm
          this.renderListButtonScore();
        }
      }
    });

    btnSend?.addEventListener("click", (e) => {
      e.stopPropagation();
      Swal.fire({
        title: "Are you sure?",
        text: "You want do it?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ff0000",
        cancelButtonColor: "##fc0303",
        confirmButtonText: "Yes,i want do it :< ",
      }).then((result) => {
        if (result.isConfirmed) {
          if (updatingFeedback) {
            btnSend.innerHTML='Send'
            // Cập nhật lại thông tin và điểm
            updatingFeedback.content = feedback;
            updatingFeedback.score = scoreActive;

            // Lưu dữ liệu mới nhất lên local
            localStorage.setItem(
              "feedbacks",
              JSON.stringify(listFeedbackLocal)
            );

            // Clean giá trị trong ô input và reset updatingFeedback
            feedbackInput!.value = "";
            updatingFeedback = null;

            // Focus vào input
            feedbackInput!.focus();

            // Load lại dữ liệu và tính điểm trung bình
            this.renderListFeedback();
            handleAverageRating();
          } else {
            // Thêm mới phản hồi nếu không phải là chức năng cập nhật
            const newFeedback = {
              feedbackId: uuidv4(),
              score: scoreActive,
              content: feedback,
            };

            listFeedbackLocal.unshift(newFeedback);
            localStorage.setItem(
              "feedbacks",
              JSON.stringify(listFeedbackLocal)
            );

            // Load lại dữ liệu và tính điểm trung bình
            this.renderListFeedback();
            handleAverageRating();

            // Clean giá trị trong ô input
            feedbackInput!.value = "";
            // Hiển thị số lượng review ra ngoài giao diện
            if (reviewNumber) {
              reviewNumber.innerHTML = listFeedbackLocal.length.toString();
            }

            // Validate dữ liệu
            if (btnSend) {
              btnSend.classList.remove("btn-dark");
            }
          }
        }
      });
    });
  }
  deleteFeedback() {
    let listFeedbackContent = document.querySelector(
      ".list-feedback-content"
    ) as HTMLElement;

    listFeedbackContent.addEventListener("click", (e) => {
      const deleteButton = (e.target as HTMLElement).closest(".fa-xmark");
      if (deleteButton) {
        Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#ff0000",
          cancelButtonColor: "##fc0303",
          confirmButtonText: "Yes, delete it!",
        }).then((result) => {
          if (result.isConfirmed) {
            const idDelete = deleteButton.id.split("_")[1];

            const filterFeedback: any[] = listFeedbackLocal.filter(
              (fb) => fb.feedbackId !== idDelete
            );

            localStorage.setItem("feedbacks", JSON.stringify(filterFeedback));

            this.renderListFeedback();
            this.handleAverageRating();
            this.renderListFeedback();
            location.reload();
          }
        });
      }
    });
  }
  renderFeedback() {}
  renderListButtonScore = () => {
    const scoreHtmls: string[] = scroses.map((score) => {
      return `
        <button class="btn-score ${
          score === scoreActive ? "active" : ""
        }" data-score="${score}">${score}</button>
      `;
    });

    const scroreHtml: string = scoreHtmls.join("");
    if (btnScoreGroup) {
      btnScoreGroup.innerHTML = scroreHtml;
    }
  };
  handleScoreButtonClick = () => {
    btnScoreGroup?.addEventListener("click", (e) => {
      const targetButton = (e.target as Element).closest(
        ".btn-score"
      ) as HTMLElement;
      console.log(targetButton);
      if (targetButton) {
        const allButtons: NodeListOf<HTMLElement> | null =
          btnScoreGroup?.querySelectorAll(".btn-score");
        allButtons?.forEach((button) => button.classList.remove("active"));
        targetButton.classList.add("active");
        scoreActive = +targetButton.dataset.score!; // Cập nhật scoreActive từ data-score
      }
    });
  };
  renderListFeedback = () => {
    const feedbackHtmls: string[] = listFeedbackLocal.map((feedback) => {
      return `
        <div class="feedback-content">
          <div class="feedback-content-header">
            <i id="update_${feedback.feedbackId}" class="fa-solid fa-pen-to-square"></i>
            <i id="delete_${feedback.feedbackId}" class="fa-solid fa-xmark"></i>
          </div>
          <div class="feedback-content-body">
            <p class="content-feedback">${feedback.content}</p>
          </div>
          <button class="btn-score active">${feedback.score}</button>
        </div>
      `;
    });

    const feedbackHtml: string = feedbackHtmls.join("");
    if (listFeedbackContent) {
      listFeedbackContent.innerHTML = feedbackHtml;
    }
    if (reviewNumber) {
      reviewNumber.innerHTML = listFeedbackLocal.length.toString();
    }
  };
  handleAverageRating() {
    if (listFeedbackLocal.length > 0) {
      const totalScoreFeedback: number = listFeedbackLocal.reduce((a, b) => {
        return a + b.score;
      }, 0);

      const averageRating: number =
        totalScoreFeedback / listFeedbackLocal.length;
      if (averageRate) {
        averageRate.innerHTML = averageRating.toFixed(1).toString();
      }
    } else {
      if (averageRate) {
        averageRate.innerHTML = "0";
      }
    }
  }
}

const scroses: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
let scoreActive: number = 10;
const btnScoreGroup: HTMLElement | null =
  document.querySelector(".btn-score-group");
const listFeedbackContent: HTMLElement | null = document.querySelector(
  ".list-feedback-content"
);
let listFeedbackLocal: any[] = JSON.parse(
  localStorage.getItem("feedbacks") || "[]"
);
const feedbackInput: HTMLInputElement | null =
  document.querySelector("#feedbackInput");
const error: HTMLElement | null = document.querySelector(".error");
const btnSend: HTMLElement | null = document.querySelector(".btn-send");
const reviewNumber: HTMLElement | null =
  document.querySelector(".review-number");
const averageRate: HTMLElement | null =
  document.querySelector(".average-number");
const inputContainer: HTMLElement | null =
  document.querySelector(".input-container");

let feedback: string = "";
inputContainer?.addEventListener("click", () => {
  feedbackInput?.focus();
});
feedbackInput?.focus();

const btnDelete: NodeListOf<Element> = document.querySelectorAll(".fa-xmark");

let updatingFeedback: any = null;

// Validate dữ liệu đầu vào
const validateData = () => {
  feedbackInput?.addEventListener("input", (e) => {
    // Nếu input không có giá trị
    const target = e.target as HTMLInputElement;
    if (!target.value.trim()) {
      // Hiển thị lỗi
      if (error) {
        error.style.display = "block";
      }
      // Thêm màu cho button
      if (btnSend) {
        btnSend.classList.remove("btn-dark");
      }
    } else {
      feedback = target!.value; // Thực hiện gán lại giá trị lấy từ input
      if (error) {
        error.style.display = "none";
      }
      if (btnSend) {
        btnSend.classList.add("btn-dark");
      }
    }
  });
};

// Tính điểm trung bình đánh giá
function handleAverageRating() {
  if (listFeedbackLocal.length > 0) {
    // Lấy ra tổng số điểm của tất cả các feedback
    const totalScoreFeedback: number = listFeedbackLocal.reduce((a, b) => {
      return a + b.score;
    }, 0);

    // Tính điểm trung bình : DTB = tổng điểm / số lượng feedback
    const averageRating: number = totalScoreFeedback / listFeedbackLocal.length;
    if (averageRate) {
      averageRate.innerHTML = averageRating.toFixed(1).toString();
    }
  } else {
    if (averageRate) {
      averageRate.innerHTML = "0";
    }
  }
}

handleAverageRating();
validateData();
// Gọi hàm xử lý khi người dùng click vào nút điểm số
function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
new Feedback(1, "23", 3);
