<template lang="pug">
  .my-default-layout.is-dark-mode-active
    nav.navbar.header.has-shadow.is-primary(role="navigation", aria-label="main navigation")
      .navbar-brand
        a.navbar-item(href="/")
          //- img(src="~assets/TooltwistLogo.png", alt="Buefy", height="28")
          img(src="~assets/tooltwist-logo-white.png", alt="Buefy", height="28")
          | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          //- .is-pulled-right
      .navbar-start
        //- .has.text-right
        .navbar-item
          .heading-name D.A.T.P.
          .heading-description Distributed Asynchronous Transaction Pipelines

        .navbar-burger
          span
          span
          span

    .hero
      Nuxt
</template>

<script>
export default {
  data () {
    return {
      darkMode: false,
    }
  },//- date()

  async created () {
    this.setDarkMode()
  },

  methods: {

    setDarkMode: function() {
      const htmlClassName = 'is-dark-mode-active'
      document.documentElement.classList.add(htmlClassName)
    },

    toggleDarkMode: function() {
      // alert(`toggle`)
      const htmlClassName = 'is-dark-mode-active'

      this.isDarkModeActive = !this.isDarkModeActive
      if (this.isDarkModeActive) {
        document.documentElement.classList.add(htmlClassName)
      } else {
        document.documentElement.classList.remove(htmlClassName)
      }
    }//- toggleDarkMode
  }//- methods

}
</script>

<style lang="scss" scoped>
.my-default-layout {
  .heading-name {
    display: inline-block;
    // font-family: 'Courier New', Courier, monospace;
    // font-size: 1.5em;
    // font-weight: 600;
    padding-top: 0px;
    padding-bottom: 0px;
    padding-left: 10px;
    padding-left: 10px;

    font-family: Work Sans;
    font-size: 30px;
    font-weight: bold;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    text-align: left;
    color: #fff;


  }


  .heading-description {
    display: inline-block;
    // font-size: 1.1em;
    padding-left: 20px;

    font-family: Work Sans;
    font-size: 16px;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    text-align: left;
    color: #b5b7c0;

  }
}
</style>