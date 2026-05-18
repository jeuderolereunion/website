"use client";

import styled from "styled-components";
import { Container } from '@/components/Container';

const Content = styled.div`
  max-width: 840px;
  padding: 0 1.5rem;
  text-align: center;
  line-height: 1.55;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
`;

const Title = styled.h2`
  font-size: clamp(2rem, 4vw, 3rem);
  margin: 0 0 1rem;
`;

const Paragraph = styled.p`
  margin: 0 0 1.25rem;
  font-size: clamp(1rem, 1.9vw, 1.25rem);
  color: rgba(255, 255, 255, 0.88);
`;

const Footer = styled.footer`
  margin-top: 2rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.35);
`;

export default function About() {
  return (
    <Container id="about">
      <Content>
        <Title>À propos</Title>
        <Paragraph>
          JDR Réunion est une association loi 1901 dédiée à la promotion et au développement
          des jeux de rôle sur table à l&apos;île de La Réunion. Nous accueillons joueurs
          débutants et expérimentés dans un esprit de convivialité et de partage.
        </Paragraph>
        <Paragraph>
          Que vous souhaitiez découvrir l&apos;univers des jeux de rôle ou rejoindre une
          communauté de passionnés, JDR Réunion est fait pour vous. Rejoignez-nous et vivez
          des aventures inoubliables.
        </Paragraph>
        <Footer>© {new Date().getFullYear()} JDR Réunion — Association loi 1901</Footer>
      </Content>
    </Container>
  );
}
