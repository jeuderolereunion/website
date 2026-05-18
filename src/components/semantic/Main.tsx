"use client";

import styled from 'styled-components';

const Main = styled.main`
  height: 100vh;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
  scroll-behavior: smooth;
  scroll-snap-type: y mandatory;

  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export { Main };
