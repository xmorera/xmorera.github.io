---

layout: post
title:  "What is Reinforcement Learning?"
date:   2025-04-10 00:00:00 -0600
categories: ["Posts"] 

---

# How Reinforcement Learning Works? 

Reinforcement learning can be compared to the process of learning to drive a car. When you first start driving, you are unsure about when to accelerate, when to brake, and when to turn. Over time, you learn from your experiences and the feedback you receive from the road and your instructor. If you drive safely and follow the rules, you get praise and positive feedback, just like a reward in reinforcement learning. On the other hand, if you make mistakes, such as running a red light or speeding, you receive consequences, such as a ticket or reprimand, just like a penalty in reinforcement learning. As you keep driving, you gradually build up a set of rules or habits, called a policy, that dictates how you drive in different situations. For example, you may know to slow down when approaching a red light and speed up when the light turns green. This policy is constantly being updated as you learn from new experiences and receive feedback from the road. Just like a computer program in reinforcement learning, you are trying to maximize your reward (in this case, a safe and smooth driving experience) by making decisions that lead to the best outcomes. Over time, you get better at driving, just like a reinforcement learning agent gets better at making decisions in its environment.

Suppose you want to teach an agent how to park a vehicle. In this case, our environment is the parking lot, our agent is one vehicle, and our main goal is to park without hitting anything (of course!). Every time our car moves without hitting anything, we can give it a small reward, but if at any time it hits something, we must punish it. The agent receives the actual state of the environment. The actual state could be its position, the distance between the vehicle and the obstacles around it, and possible actions. These actions could be accelerating, stopping, reversing, or turning the wheel. We must let the vehicle try to park hundreds of times to fail and learn from its failures until it makes the right choices. For each iteration, they must check out the environment and choose one action, repeating this until the agent succeeds or fails. Of course, we must repeat this with hundreds of agents in hundreds or thousands of iterations. Some will learn how to park a car, and some will not. After all this training, we have an agent who has learned how to park completely alone without us telling or "programming" it to do it.

![ai learns to park](https://mlgstorageaccount.blob.core.windows.net/images/8E375F358A15BED22EBE1A08431105CA.gif)