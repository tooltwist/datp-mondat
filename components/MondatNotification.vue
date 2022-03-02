/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template>
  <div class="frame-outer">
    <div class="frame-inner">
      <span class="my-text">
        <slot></slot>
      </span>
    </div>
  </div>
</template>

<script>
export default {

}
</script>

<style lang="scss" scoped>
.frame-outer {
  flex-grow: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 14px;
}

.frame-inner {
  flex-grow: 0;
  padding-top: 15px;
  padding-right: 45px;
  padding-bottom: 15px;
  padding-left: 45px;
  border-radius: 4px;
  border-color: #909090;
  background-color: #594cb2;
  background-color: black;
  background-color: #e0e0e0;
  background-color: #303030;
  // background-color: red;
}

.my-text {
  flex-grow: 0;
  font-family: Open Sans;
  font-size: 14px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 180%;
  letter-spacing: normal;
  // text-align: left;
  text-align: justify;
  color: rgba(255, 255, 255, 0.6);
  // color: #909090;

  // spacing between paragraphs
  // p + p {
  //   margin-top: 8px;
  // }
}

</style>