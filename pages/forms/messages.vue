<template lang="pug">
.my-messages
  section.section(v-if="service.text")
    h1.title Service {{ service.text }}
    hr

    table.mytable
      tr
        td.my-client-container.td(rowspan="2")
          .my-client-box
            .my-client-text
              | Client Application
        //- td.td(rowspan="2")
        //-   | CLIENT BROWSER
        td.td.my-right-arrow
          b-icon(icon="arrow-right", size="is-large")
        td.td.my-message
          .my-message-block
            b.is-size-6 &nbsp;Request ({{ request.sequence }})
            pre
              | {{ request.text }}
        td.td.my-right-arrow
          b-icon(icon="arrow-right", size="is-large")
        td.my-gateway-container.td(rowspan="2")
          .my-gateway-box
            .my-gateway-text
              | PETNET Gateway
        td.td.my-right-arrow
          b-icon(icon="arrow-right", size="is-large")
        td.td.my-message
          .my-message-block
            b.is-size-6 &nbsp; Backend Request ({{ backendRequest.sequence }})
            pre
              | {{ backendRequest.text }}
        td.td.my-right-arrow
          b-icon(icon="arrow-right", size="is-large")
        td.my-backend-container.td(rowspan="2")
          .my-backend-box
            .my-backend-text
              | {{ service.text }}
      tr
        // client
        td.td.my-left-arrow
          b-icon(icon="arrow-left", size="is-large")
        td.my-message
          .my-message-block
            b.is-size-6 &nbsp;Response ({{ response.sequence }})
            pre
              | {{ response.text }}
        td.td.my-left-arrow
          b-icon(icon="arrow-left", size="is-large")
        td.td.my-left-arrow
          b-icon(icon="arrow-left", size="is-large")
        td.my-message
          .my-message-block
            b.is-size-6 &nbsp;Backend Response ({{ backendResponse.sequence }})
            pre
              | {{ backendResponse.text }}
        td.td.my-left-arrow
          b-icon(icon="arrow-left", size="is-large")
        // backend

    //- .columns
    //-   .column
    //-     h1.title.is-size-5 Request
    //-     p sequence: {{request.sequence}}
    //-     pre
    //-       | {{request.text}}
    //-   .column
    //-     h1.title.is-size-5 Backend Request
    //-     p sequence: {{backendRequest.sequence}}
    //-     pre
    //-       | {{backendRequest.text}}
    //-   .column
    //-     h1.title.is-size-5 Backend Response
    //-     p sequence: {{backendResponse.sequence}}
    //-     pre
    //-       | {{backendResponse.text}}
    //-   .column
    //-     h1.title.is-size-5 Response
    //-     p sequence: {{response.sequence}}
    //-     pre
    //-       | {{response.text}}
  section.section(v-else)
    br
    br
    h1.title.is-error No service called yet

</template>

<script>
import axios from "axios";

export default {
  name: "Messages",
  data() {
    return {
      service: {
        sequence: 0,
        text: "",
      },
      request: {
        sequence: 0,
        text: "",
      },
      backendRequest: {
        sequence: 0,
        text: "",
      },
      backendResponse: {
        sequence: 0,
        text: "",
      },
      response: {
        sequence: 0,
        text: "",
      },

      // interval timer
      interval: null,
    };
  },
  methods: {
    async loadLatestMessages() {
      // console.log(`loadLatestMessages`)

      const url = `http://localhost:57990/admin/latestLogEntries/service,request,backendRequest,backendResponse,response`;
      const reply = await axios.get(url);
      const data = reply.data;
      // console.log(`data=`, data)

      if (data.service && data.service.sequence !== this.service.sequence) {
        this.service.sequence = data.service.sequence;
        this.service.text = data.service.text;
      }
      if (data.request && data.request.sequence !== this.request.sequence) {
        this.request.sequence = data.request.sequence;
        this.request.text = data.request.text;
      }
      if (
        data.backendRequest &&
        data.backendRequest.sequence !== this.backendRequest.sequence
      ) {
        this.backendRequest.sequence = data.backendRequest.sequence;
        this.backendRequest.text = data.backendRequest.text;
      }
      if (
        data.backendResponse &&
        data.backendResponse.sequence !== this.backendResponse.sequence
      ) {
        this.backendResponse.sequence = data.backendResponse.sequence;
        this.backendResponse.text = data.backendResponse.text;
      }
      if (data.response && data.response.sequence !== this.response.sequence) {
        this.response.sequence = data.response.sequence;
        this.response.text = data.response.text;
      }
    },
  },
  mounted() {
    // console.log(`mounted`)
    this.loadLatestMessages();

    // Set an interval timer to refresh the page
    this.interval = setInterval(this.loadLatestMessages, 2000);
  },
  beforeDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  },
};
</script>

<style lang="scss" scoped>
.my-messages {
  .mytable {
    width: 100%;

    td.my-message {
      font-size: 13px;
      min-width: 200px;
      // padding-left: 20px;
      padding-bottom: 20px;
      vertical-align: middle;

      .my-message-block {
        background-color: blanchedalmond;
      }
    }

    td.my-right-arrow {
      width: 40px;
      // background-color: yellow;
      vertical-align: middle;
    }

    td.my-left-arrow {
      width: 40px;
      // background-color: pink;
      vertical-align: middle;
    }

    // table {
    width: 100%;
    height: 100%;
    // }

    & tr {
      width: 100%;
      height: 100%;
    }

    & td.my-client-container {
      width: 120px;
      margin-left: 20px;

      .my-client-box {
        // Div that fills the table cell
        display: inline-block;
        // border-radius: 15px;
        border: 3px dashed #faa;
        background-color: #faf7f7;
        width: 100%;
        height: 100%;
        position: relative;

        .my-client-text {
          // Box to contain the text
          display: block;
          margin: 0;
          position: absolute;
          left: -120px;
          top: 45%;
          transform: translate(-50%, -50%);
          text-align: center;
          transform: rotate(-90deg);
          color: #faa;
          font-size: 2em;
          white-space: nowrap;
          width: 350px;
          // background-color: blanchedalmond;
        }
      }
    }

    & td.my-gateway-container {
      width: 90px;
      margin-left: 20px;

      .my-gateway-box {
        // Div that fills the table cell
        display: inline-block;
        border-radius: 15px;
        border: 1px solid #333;
        width: 100%;
        height: 100%;
        position: relative;

        .my-gateway-text {
          // Box to contain the text
          display: block;
          margin: 0;
          position: absolute;
          left: -130px;
          top: 45%;
          transform: translate(-50%, -50%);
          text-align: center;
          transform: rotate(-90deg);
          font-size: 2em;
          white-space: nowrap;
          width: 350px;
          // background-color: blanchedalmond;
        }
      }
    }

    & td.my-backend-container {
      width: 90px;
      margin-left: 20px;

      .my-backend-box {
        // Div that fills the table cell
        display: inline-block;
        border-radius: 15px;
        border: 1px solid #333;
        width: 100%;
        height: 100%;
        position: relative;

        .my-backend-text {
          // Box to contain the text
          display: block;
          margin: 0;
          position: absolute;
          left: -130px;
          top: 45%;
          transform: translate(-50%, -50%);
          text-align: center;
          transform: rotate(-90deg);
          font-size: 2em;
          white-space: nowrap;
          width: 350px;
          // background-color: blanchedalmond;
        }
      }
    }
  }
}
</style>