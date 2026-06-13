# IMPORTANT

This project is optimized for a 26-month-old child, not for adult users. Whenever there is a trade-off between features and simplicity, always choose simplicity.

---

# Project Overview

This project is an educational word-card PWA designed for a 26-month-old boy to use on an iPad.

The application should focus on visual learning, simple interactions, and immediate feedback. Users cannot read yet, so image-based learning is the primary experience.

The app will be deployed on Vercel and maintained through GitHub.

---

# Core Principles

## Priority Order

Always prioritize decisions in the following order:

1. Child usability
2. Responsiveness and performance
3. Simplicity
4. Maintainability
5. Feature richness

If a feature makes the interface more complicated, prefer a simpler solution.

---

# Target User

## Primary User

* 26-month-old toddler
* Cannot read Korean or English
* Learns primarily through images and audio
* Has limited attention span
* Requires large touch targets
* Needs immediate visual and audio feedback

## UX Guidelines

Always follow these principles:

* Image-first design
* Audio-assisted learning
* Minimal text
* Large buttons
* Obvious interactions
* Fast response to touch
* No complex navigation
* No hidden actions

---

# Performance Requirements

Performance is a core feature.

The application must feel instant.

## Rules

* Minimize bundle size
* Avoid unnecessary dependencies
* Avoid expensive re-renders
* Keep animations lightweight
* Maintain smooth 60fps interactions
* Never block the UI during audio playback
* Optimize for iPad Safari

---

# PWA Requirements

The application must function as a proper Progressive Web App.

Required features:

* Home Screen Installation
* Standalone Display Mode
* Offline Support
* App Icons
* Splash Screens
* Mobile Optimization

The primary target platform is iPad Safari.

---

# Image Policy

Images are the most important content in the application.

## Rules

* Use real images or high-quality illustrations
* Do not use emoji as primary card content
* Support graceful image fallback states
* Optimize image loading performance
* Consider preloading upcoming card images
* Prioritize fast loading over image quality

---

# Audio Policy

Audio is a primary learning mechanism.

## Requirements

* Korean pronunciation (ko-KR)
* English pronunciation (en-US)
* Success sound effects

## Rules

* Audio failures must never break the app
* Prevent overlapping audio playback
* Handle rapid repeated taps safely
* Keep playback responsive

---

# Design System

## Visual Style

The design should feel:

* Friendly
* Warm
* Playful
* Safe
* Calm

Avoid overstimulation.

## Preferred Colors

* Pastel Blue
* Pastel Green
* Pastel Yellow

Avoid excessive use of:

* Bright red
* Neon colors
* High-contrast flashing effects

## Components

Use:

* Rounded corners
* Large touch areas
* Clear spacing
* Simple layouts
* Smooth animations

---

# Folder Structure

Maintain a scalable and organized architecture.

Recommended structure:

src/
├── app/
├── components/
├── hooks/
├── data/
├── types/
├── utils/
├── constants/

public/
├── images/
│ ├── fruits/
│ ├── vegetables/
│ └── vehicles/

All business logic, data, and UI concerns should remain separated.

---

# Component Architecture

Components should have a single responsibility.

Recommended components:

components/
├── CategorySelector
├── CardViewer
├── AudioButtons
├── NavigationButtons
├── ProgressIndicator
├── SuccessEffect
├── HomeButton
├── LoadingState
└── ErrorState

Keep components small and reusable.

---

# State Management

Keep state management simple.

Preferred order:

1. useState
2. useReducer
3. Context API

Do not introduce Redux, MobX, or other global state libraries unless absolutely necessary.

---

# Code Quality Standards

## TypeScript

* Use strict typing
* Avoid any
* Create reusable shared types
* Keep type definitions centralized

## React

* Prevent unnecessary re-renders
* Use React.memo where beneficial
* Use useCallback when appropriate
* Use useMemo for expensive computations

Do not optimize prematurely, but avoid obvious inefficiencies.

---

# Accessibility

Even though the target user is a toddler, basic accessibility standards must be maintained.

Requirements:

* Semantic HTML
* aria-label attributes
* Keyboard accessibility
* Screen reader compatibility where practical

---

# Dependency Policy

Before adding a dependency, ask:

1. Is it truly necessary?
2. Can this be implemented directly?
3. What is the bundle size impact?
4. Does it affect startup performance?

Prefer lightweight custom implementations.

---

# Error Handling

The application must fail gracefully.

Requirements:

* Missing images must not break the UI
* Audio failures must not break the UI
* Invalid card data must not crash the application
* Show friendly fallback states

---

# Future Expansion

The architecture should support adding categories without major code changes.

Expected future categories:

* Animals
* Colors
* Numbers
* Food
* Occupations
* Household Objects

New categories should ideally be added through data files only.

---

# Testing Checklist

Before considering a task complete:

* npm run lint passes
* npm run build succeeds
* No TypeScript errors
* No console errors
* PWA install works
* Offline mode works
* iPad Safari works correctly
* Touch interactions work smoothly
* Audio playback works correctly
* Images load correctly

---

# Definition of Done

A feature is considered complete only if:

* It works as intended
* It is type-safe
* It does not degrade performance
* It does not break existing functionality
* It follows the project architecture
* Documentation is updated when needed
* It provides a good experience for a 26-month-old child

User experience always takes precedence over technical elegance.
