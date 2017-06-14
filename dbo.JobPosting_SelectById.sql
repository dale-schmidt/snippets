ALTER PROC [dbo].[JobPosting_SelectById]
			@Id INT

AS

/* Test Code

DECLARE @Id INT = 32

EXECUTE dbo.JobPosting_SelectById
		@Id


*/

BEGIN

	SELECT JP.Id
		  ,CompanyId
		  ,CO.CompanyName
		  ,[PositionName]
		  ,StreetAddress
		  ,JP.[City]
		  ,JP.[StateProvinceId]
		  ,JP.[CountryId]
		  ,Compensation
		  ,CompensationRateId
		  ,FullPartId
		  ,ContractPermanentId
		  ,ExperienceLevelId
		  ,[Description]
		  ,[Responsibilities]
		  ,[Requirements]
		  ,[ContactInformation]
		  ,[JobPostingStatusId]
		  ,JP.[DateCreated]
		  ,JP.[DateModified]
		  ,C.Name AS CountryName
		  ,SP.Name AS StateProvinceName
		  ,Location.Lat AS Latitude
		  ,Location.Long AS Longitude
		  ,COUNT(*) OVER () TotalRows
	  FROM [dbo].[JobPosting] JP
	  LEFT JOIN dbo.Country C ON C.Id = JP.CountryId
	  LEFT JOIN dbo.StateProvince SP ON SP.Id = JP.StateProvinceId
	  LEFT JOIN dbo.Company CO ON CO.Id = JP.CompanyId
	  WHERE JP.Id = @Id

	  
	  SELECT JP.Id AS JobPostingId
			 ,JT.Id AS JobTagId
			 ,JT.Keyword
			 ,JT.DisplayOrder
			
	  FROM [dbo].[JobPosting] JP
	  JOIN dbo.JobPostingJobTag JPJT ON JPJT.JobPostingId = JP.Id
	  JOIN dbo.JobTag JT ON JPJT.JobTagId = JT.Id
	  WHERE JP.Id = @Id

	  SELECT JA.Id
			,PersonId
			,P.FirstName
			,P.LastName
			,P.JobTitle
			,P.Resume
			,CoverLetter
			,JAS.Name AS ApplicationStatus
			,Notes
			,JA.DateCreated
	  FROM dbo.JobApplication JA
	  JOIN Person P ON PersonId = P.ID
	  JOIN JobApplicationStatus JAS ON JA.StatusId = JAS.Id
	  WHERE JA.JobPostingId = @Id
	  

END