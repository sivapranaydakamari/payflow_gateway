(function () {
  class PaymentGateway {
    constructor(options) {
      if (!options || !options.key || !options.orderId) {
        throw new Error("key and orderId are required");
      }

      this.key = options.key;
      this.orderId = options.orderId;
      this.onSuccess = options.onSuccess || function () {};
      this.onFailure = options.onFailure || function () {};
      this.onClose = options.onClose || function () {};

      this.handleMessage = this.handleMessage.bind(this);
    }

    open() {
      // Modal container
      this.modal = document.createElement("div");
      this.modal.id = "payment-gateway-modal";
      this.modal.setAttribute("data-test-id", "payment-modal");

      this.modal.innerHTML = `
        <div style="
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        ">
          <div style="
            width: 450px;
            height: 600px;
            background: #fff;
            border-radius: 10px;
            position: relative;
            overflow: hidden;
          ">
            <button
              data-test-id="close-modal-button"
              style="
                position: absolute;
                top: 8px;
                right: 12px;
                border: none;
                background: none;
                font-size: 22px;
                cursor: pointer;
              "
            >×</button>

            <iframe
              data-test-id="payment-iframe"
              src="http://localhost:3001/checkout?order_id=${this.orderId}&embedded=true"
              style="width:100%; height:100%; border:none;"
            ></iframe>
          </div>
        </div>
      `;

      document.body.appendChild(this.modal);

      this.modal
        .querySelector("[data-test-id='close-modal-button']")
        .onclick = () => this.close();

      window.addEventListener("message", this.handleMessage);
    }

    handleMessage(event) {
      if (!event.data || !event.data.type) return;

      if (event.data.type === "payment_success") {
        this.onSuccess(event.data.data);
        this.close();
      }

      if (event.data.type === "payment_failed") {
        this.onFailure(event.data.data);
      }

      if (event.data.type === "close_modal") {
        this.close();
      }
    }

    close() {
      window.removeEventListener("message", this.handleMessage);

      if (this.modal) {
        document.body.removeChild(this.modal);
        this.modal = null;
      }

      this.onClose();
    }
  }

  window.PaymentGateway = PaymentGateway;
})();
