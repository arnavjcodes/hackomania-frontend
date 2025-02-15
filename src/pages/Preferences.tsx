import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  useTheme,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axios from "axios";

interface Quiz {
  id: number;
  title: string;
  description: string;
  active: boolean;
  quiz_questions: QuizQuestion[];
}

interface QuizQuestion {
  id: number;
  content: string;
  quiz_answers: QuizAnswer[];
}

interface QuizAnswer {
  id: number;
  content: string;
}

const SetupPreferences: React.FC = () => {
  const theme = useTheme();

  const [activeStep, setActiveStep] = useState(0);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});

  // Add the missing handler function
  const handleCategorySelection = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, quizzesRes] = await Promise.all([
          axios.get("/api/v1/categories", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          axios.get("/api/v1/quizzes", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
        ]);
        setCategories(categoriesRes.data);
        setQuizzes(quizzesRes.data.filter((q: Quiz) => q.active));
      } catch (error) {
        console.error("Initialization failed:", error);
        setError("Failed to load setup data. Please try again later.");
      }
    };
    fetchData();
  }, []);

  const handleQuizAnswer = (questionId: number, answerId: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

  const handleNextStep = () => {
    if (activeStep === 0 && !allQuizQuestionsAnswered) return;
    setActiveStep((prev) => prev + 1);
  };

  const handlePreviousStep = () => {
    setActiveStep((prev) => prev - 1);
  };

  const allQuizQuestionsAnswered = quizzes[0]?.quiz_questions.every((q) =>
    selectedAnswers.hasOwnProperty(q.id)
  );

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Prepare the quiz response payload
      const quizResponsePayload = {
        quiz_response: {
          quiz_id: quizzes[0].id,
          responses: Object.entries(selectedAnswers).reduce(
            (acc, [questionId, answerId]) => {
              acc[questionId] = answerId;
              return acc;
            },
            {} as Record<string, number>
          ),
        },
      };

      console.log("Quiz response paylod", quizResponsePayload);

      // Submit quiz responses
      await axios.post(
        `/api/v1/quizzes/${quizzes[0].id}/responses`,
        quizResponsePayload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Prepare user preferences payload
      const userPreferencesPayload = {
        user: {
          preferences: {
            categories: selectedCategories,
            notifications: { push: true },
          },
        },
      };

      // Update user preferences
      await axios.put("/api/v1/user", userPreferencesPayload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      // Redirect after successful setup
      window.location.href = "/settings";
    } catch (error) {
      console.error("Setup failed:", error);
      setError("Failed to complete setup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              {quizzes[0]?.title}
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
              {quizzes[0]?.description}
            </Typography>

            {quizzes[0]?.quiz_questions.map((question) => (
              <Box key={question.id} sx={{ mb: 6 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {question.content}
                </Typography>
                <Grid container spacing={3}>
                  {question.quiz_answers.map((answer) => (
                    <Grid item xs={12} sm={6} key={answer.id}>
                      <Card
                        sx={{
                          backgroundColor:
                            selectedAnswers[question.id] === answer.id
                              ? theme.palette.primary.main
                              : theme.palette.background.paper,
                          color:
                            selectedAnswers[question.id] === answer.id
                              ? theme.palette.background.default
                              : theme.palette.text.primary,
                          borderRadius: theme.shape.borderRadius,
                          cursor: "pointer",
                          boxShadow:
                            selectedAnswers[question.id] === answer.id
                              ? "0px 4px 15px rgba(255, 255, 255, 0.2)"
                              : "0px 2px 10px rgba(255, 255, 255, 0.1)",
                          transition: "all 0.3s ease-in-out",
                          position: "relative",
                        }}
                        onClick={() => handleQuizAnswer(question.id, answer.id)}
                      >
                        {selectedAnswers[question.id] === answer.id && (
                          <CheckCircleIcon
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              fontSize: "1.5rem",
                              color: theme.palette.background.default,
                            }}
                          />
                        )}
                        <CardActionArea>
                          <CardContent
                            sx={{
                              minHeight: 120,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Typography
                              sx={{ textAlign: "center" }}
                              variant="body1"
                            >
                              {answer.content}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
          </Box>
        );
      case 1:
        return (
          <>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                mb: 4,
                "& .MuiOutlinedInput-root": {
                  borderRadius: theme.shape.borderRadius,
                },
              }}
            />

            <Grid container spacing={3}>
              {categories
                .filter((item) =>
                  item.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Card
                      sx={{
                        backgroundColor: selectedCategories.includes(item.id)
                          ? theme.palette.primary.main
                          : theme.palette.background.paper,
                        color: selectedCategories.includes(item.id)
                          ? theme.palette.background.default
                          : theme.palette.text.primary,
                        borderRadius: theme.shape.borderRadius,
                        cursor: "pointer",
                        boxShadow: selectedCategories.includes(item.id)
                          ? "0px 4px 15px rgba(255, 255, 255, 0.2)"
                          : "0px 2px 10px rgba(255, 255, 255, 0.1)",
                        transition: "all 0.3s ease-in-out",
                        position: "relative",
                      }}
                      onClick={() => handleCategorySelection(item.id)}
                    >
                      {selectedCategories.includes(item.id) && (
                        <CheckCircleIcon
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            fontSize: "1.5rem",
                            color: theme.palette.background.default,
                          }}
                        />
                      )}
                      <CardActionArea>
                        <CardContent
                          sx={{
                            height: 150,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography sx={{ textAlign: "center" }} variant="h6">
                            {item.name}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
        p: 4,
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          margin: "0 auto",
          color: theme.palette.text.primary,
        }}
      >
        <Stepper
          activeStep={activeStep}
          sx={{
            mb: 6,
            backgroundColor: "transparent",
            padding: 0,
          }}
        >
          <Step>
            <StepLabel>Personality Quiz</StepLabel>
          </Step>
          <Step>
            <StepLabel>Category Selection</StepLabel>
          </Step>
        </Stepper>

        {error && (
          <Typography color="error" sx={{ mb: 2, textAlign: "center" }}>
            {error}
          </Typography>
        )}

        {getStepContent(activeStep)}

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button
            variant="outlined"
            onClick={handlePreviousStep}
            disabled={activeStep === 0 || loading}
            sx={{
              borderRadius: theme.shape.borderRadius,
            }}
          >
            Back
          </Button>

          {activeStep === 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || selectedCategories.length === 0}
              sx={{
                borderRadius: theme.shape.borderRadius,
              }}
            >
              {loading ? <CircularProgress size={24} /> : "Complete Setup"}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNextStep}
              disabled={!allQuizQuestionsAnswered || loading}
              sx={{
                borderRadius: theme.shape.borderRadius,
              }}
            >
              Continue
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default SetupPreferences;
