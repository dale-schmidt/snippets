ALTER PROC [dbo].[JobPosting_SearchByKeyword]
			@SearchString NVARCHAR(1000)
			,@CurrentPage INT = 1
			,@ItemsPerPage INT = 5
			,@Latitude DECIMAL(10,7) = null
			,@Longitude DECIMAL(10,7) = null
			,@Distance INT = 0
			,@Compensation INT = 0
			,@FullPartId INT = 0
			,@ContractPermanentId INT = 0
			,@ExperienceLevelId INT = 0
			,@IsDeploy BIT = 0
			,@JobTagIds dbo.IntIdTable READONLY
			

AS

/* TEST CODE

DECLARE @SearchString NVARCHAR(1000) = ''
		,@CurrentPage INT = 1
		,@ItemsPerPage INT = 8
		,@Latitude DECIMAL(10,7)
		,@Longitude DECIMAL(10,7)
		,@Distance INT = 0
		,@Compensation INT = 0
		,@FullPartId INT = 0
		,@ContractPermanentId INT = 0
		,@ExperienceLevelId INT = 0
		,@IsDeploy BIT = 0
		,@JobTagIds dbo.IntIdTable
		
			 
		


EXECUTE dbo.JobPosting_SearchByKeyword
		@SearchString
		,@CurrentPage
		,@ItemsPerPage
		,@Latitude
		,@Longitude
		,@Distance
		,@Compensation
		,@FullPartId
		,@ContractPermanentId 
		,@ExperienceLevelId
		,@IsDeploy
		,@JobTagIds

*/

BEGIN
	
	SET @SearchString =
		CASE WHEN @SearchString = ''
			THEN '""'
			ELSE @SearchString
		END

	DECLARE @Location GEOGRAPHY
	IF @Latitude IS NOT NULL AND @Longitude IS NOT NULL
		SET @Location = geography::Point(@Latitude, @Longitude, 4326)

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
	  INTO #TempTable
	  FROM [dbo].[JobPosting] JP
	  LEFT JOIN dbo.Country C ON C.Id = JP.CountryId
	  LEFT JOIN dbo.StateProvince SP ON SP.Id = JP.StateProvinceId
	  LEFT JOIN dbo.Company CO ON CO.Id = JP.CompanyId
	  WHERE ((@SearchString = '""') OR FREETEXT ((PositionName, JP.City, Description, Responsibilities, Requirements), @SearchString))
	  AND (CO.IsDeploy = @IsDeploy)
	  AND ((@Distance = 0) OR (@Location IS NULL) OR (@Location.STDistance(Location) <= @Distance))
	  AND ((@Compensation = 0) OR (Compensation >= @Compensation))
	  AND ((@FullPartId = 0) OR (FullPartId = @FullPartId))
	  AND ((@ContractPermanentId = 0) OR (ContractPermanentId = @ContractPermanentId))
	  AND ((@ExperienceLevelId = 0) OR (ExperienceLevelId = @ExperienceLevelId))
	  AND (JP.JobPostingStatusId = 1)
	  AND (((SELECT COUNT(data) FROM @JobTagIds) = 0) 
				OR (JP.ID IN (SELECT JPJT.JobPostingId 
								FROM @JobTagIds JTI
								LEFT JOIN JobPostingJobTag JPJT ON JPJT.JobTagId = JTI.Data
								GROUP BY JPJT.JobPostingId
								HAVING COUNT(DISTINCT JPJT.JobTagId) = (SELECT COUNT(data) FROM @JobTagIds))))
	  ORDER BY JP.DateCreated DESC
	  OFFSET @ItemsPerPage * (@CurrentPage - 1) ROWS
	  FETCH NEXT @ItemsPerPage ROWS ONLY

	  SELECT *
	  FROM #TempTable

	  SELECT JP.Id AS JobPostingId
			 ,JT.Id AS JobTagId
			 ,JT.Keyword
			 ,JT.DisplayOrder			
	  FROM [dbo].[JobPosting] JP
	  JOIN dbo.JobPostingJobTag JPJT ON JPJT.JobPostingId = JP.Id
	  JOIN dbo.JobTag JT ON JPJT.JobTagId = JT.Id
	  WHERE JP.Id IN (SELECT Id FROM #TempTable)
END